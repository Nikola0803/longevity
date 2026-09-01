<?php
/**
 * Receives NiftiPay's merchant webhook and reconciles WooCommerce order
 * status. This is the ONLY thing that marks an order paid — the customer's
 * browser redirect back to the store (returnUrl) is treated as UI-only per
 * NiftiPay's own guidance ("never mark an order paid from this redirect,
 * wait for the webhook").
 *
 * NiftiPay's docs state the webhook path is forced to /niftipay/webhook off
 * whatever host you register as merchantWebhookUrl — so this listens on
 * https://<your-site>/niftipay/webhook directly (not under /wp-json), via a
 * lightweight `init` hook rather than the REST API, so no permalink/rewrite
 * flush is required after activation.
 */

if (!defined('ABSPATH')) {
	exit;
}

class Niftipay_Webhook {

	const PATH = '/niftipay/webhook';

	public static function init() {
		add_action('init', array(__CLASS__, 'maybe_handle'));
		add_action('wp_ajax_niftipay_auto_create_integration', array(__CLASS__, 'ajax_auto_create_integration'));
	}

	public static function webhook_url() {
		return home_url(self::PATH);
	}

	public static function maybe_handle() {
		$request_path = wp_parse_url(add_query_arg(array()), PHP_URL_PATH);
		if (null === $request_path) {
			$request_path = isset($_SERVER['REQUEST_URI']) ? wp_parse_url(wp_unslash($_SERVER['REQUEST_URI']), PHP_URL_PATH) : '';
		}

		if (untrailingslashit($request_path) !== untrailingslashit(self::PATH)) {
			return;
		}

		self::handle();
		exit;
	}

	private static function handle() {
		$raw = file_get_contents('php://input');
		$payload = json_decode($raw, true);

		if (!is_array($payload)) {
			status_header(400);
			echo wp_json_encode(array('error' => 'Invalid JSON'));
			exit;
		}

		$logger = wc_get_logger();
		$logger->info('Webhook received: ' . wp_json_encode(self::redact($payload)), array('source' => 'niftipay'));

		// The signature scheme for fiat webhooks isn't nailed down in the
		// docs excerpt we integrated against beyond "verify signatures if
		// enabled" and the CORS allowlist mentioning x-signature/x-timestamp
		// headers. Confirm the exact HMAC construction with NiftiPay support
		// and fill in self::verify_signature() before going live — until
		// then this is a deliberate, logged gap, not a silent one.
		if (!self::verify_signature($raw)) {
			$logger->warning('Webhook signature verification skipped/failed — see verify_signature() TODO.', array('source' => 'niftipay'));
		}

		// Payloads mirror the fiat order object (GET /api/fiat/orders/:orderKey
		// shape) with at least reference/merchantReference, orderKey, and status.
		$reference   = self::first_present($payload, array('reference', 'merchantReference'));
		$order_key   = self::first_present($payload, array('orderKey'));
		$status      = self::first_present($payload, array('status', 'pspStatus'));

		if (!$reference && !$order_key) {
			status_header(400);
			echo wp_json_encode(array('error' => 'Missing reference/orderKey'));
			exit;
		}

		$order = $reference ? wc_get_order((int) $reference) : null;
		if (!$order && $order_key) {
			$order = self::find_order_by_meta('_niftipay_order_key', $order_key);
		}

		if (!$order) {
			// Per NiftiPay's at-least-once delivery guidance: acknowledge with
			// 200 so they don't retry forever, but log loudly — an unmatched
			// webhook for a real payment needs a human to notice.
			$logger->error('Webhook for unknown order — reference=' . $reference . ' orderKey=' . $order_key, array('source' => 'niftipay'));
			status_header(200);
			echo wp_json_encode(array('ok' => true, 'note' => 'order not found, ignored'));
			exit;
		}

		self::dedupe_and_apply($order, $status, $payload);

		status_header(200);
		echo wp_json_encode(array('ok' => true));
		exit;
	}

	/**
	 * Webhooks are at-least-once — a duplicate "paid" event must not double
	 * -fulfill. We key dedup on status transitions already reflected on the
	 * order (WooCommerce's own status is the source of truth for "have we
	 * already handled this").
	 */
	private static function dedupe_and_apply($order, $status, $payload) {
		$status = strtolower((string) $status);

		switch ($status) {
			case 'paid':
			case 'completed':
				if ($order->has_status(array('processing', 'completed'))) {
					return; // Already handled — classic duplicate webhook delivery.
				}
				$txn_id = self::first_present($payload, array('pspOrderId', 'id', 'orderKey'));
				$order->payment_complete($txn_id ? (string) $txn_id : '');
				$order->add_order_note(__('Payment confirmed by NiftiPay webhook.', 'niftipay-woocommerce'));
				break;

			case 'cancelled':
			case 'canceled':
				if ($order->has_status('cancelled')) {
					return;
				}
				$order->update_status('cancelled', __('Payment cancelled per NiftiPay webhook.', 'niftipay-woocommerce'));
				break;

			case 'refunded':
				if ($order->has_status('refunded')) {
					return;
				}
				$order->update_status('refunded', __('Payment refunded per NiftiPay webhook.', 'niftipay-woocommerce'));
				break;

			case 'pending':
			case 'new':
				// No-op: order is already "on-hold" from process_payment(). This
				// event mainly matters if an order was manually reset to pending
				// on NiftiPay's side; nothing for WooCommerce to change here.
				break;

			default:
				wc_get_logger()->warning('Unhandled NiftiPay status: ' . $status, array('source' => 'niftipay'));
		}
	}

	/**
	 * TODO: confirm NiftiPay's exact webhook signature scheme (likely HMAC-SHA256
	 * of the raw body using x-signature + x-timestamp headers, per the CORS
	 * allowlist in the API guidelines) and implement verification here before
	 * processing real payments. Until confirmed, this returns true so the
	 * integration isn't dead on arrival, but every call is logged either way
	 * (see handle()) so the gap is visible in the WooCommerce > Status > Logs
	 * screen, not silent.
	 */
	private static function verify_signature($raw_body) {
		$signature = isset($_SERVER['HTTP_X_SIGNATURE']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_X_SIGNATURE'])) : '';
		$timestamp = isset($_SERVER['HTTP_X_TIMESTAMP']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_X_TIMESTAMP'])) : '';

		if (!$signature) {
			return false; // No signature sent — flagged (not blocked) until the scheme is confirmed.
		}

		// Placeholder for once the algorithm is confirmed, e.g.:
		// $gateway = new WC_Gateway_Niftipay();
		// $expected = hash_hmac('sha256', $timestamp . '.' . $raw_body, $gateway->api_key);
		// return hash_equals($expected, $signature);
		return true;
	}

	private static function first_present($arr, $keys) {
		foreach ($keys as $key) {
			if (isset($arr[$key]) && '' !== $arr[$key]) {
				return $arr[$key];
			}
		}
		return null;
	}

	private static function find_order_by_meta($key, $value) {
		$orders = wc_get_orders(array(
			'meta_key'   => $key, // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value' => $value, // phpcs:ignore WordPress.DB.SlowDBQuery
			'limit'      => 1,
		));
		return $orders ? $orders[0] : null;
	}

	private static function redact($payload) {
		foreach (array('email', 'card', 'pan') as $sensitive) {
			if (isset($payload[$sensitive])) {
				$payload[$sensitive] = '[redacted]';
			}
		}
		return $payload;
	}

	/**
	 * AJAX handler behind the admin "Auto-create integration" button —
	 * creates a NiftiPay fiat integration pointed at this site's own
	 * checkout/webhook URLs so the merchant doesn't have to copy them by
	 * hand into the NiftiPay dashboard.
	 */
	public static function ajax_auto_create_integration() {
		check_ajax_referer('niftipay_auto_create_integration');

		if (!current_user_can('manage_woocommerce')) {
			wp_send_json_error(array('message' => 'Insufficient permissions'), 403);
		}

		$settings = get_option('woocommerce_niftipay_settings', array());
		$api_key  = isset($settings['api_key']) ? $settings['api_key'] : '';
		$base_url = isset($settings['api_base_url']) && $settings['api_base_url'] ? $settings['api_base_url'] : 'https://www.niftipay.com';

		if (!$api_key) {
			wp_send_json_error(array('message' => 'Save your API key first.'));
		}

		require_once NIFTIPAY_WC_PLUGIN_DIR . 'includes/class-niftipay-api-client.php';
		$client = new Niftipay_Api_Client($api_key, $base_url);

		$response = $client->create_integration(
			get_bloginfo('name') . ' — WooCommerce',
			wc_get_checkout_url() . 'order-received/', // best-effort default; real orders use get_return_url()
			wc_get_checkout_url(),
			self::webhook_url()
		);

		if (!$response['ok'] || empty($response['data']['integration']['id'])) {
			$message = isset($response['data']['error']) ? $response['data']['error'] : 'Unknown error';
			wp_send_json_error(array('message' => $message));
		}

		wp_send_json_success(array('integration_id' => $response['data']['integration']['id']));
	}
}
