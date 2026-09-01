<?php
/**
 * WooCommerce payment gateway backed by NiftiPay's fiat card orders.
 *
 * Flow (per https://www.niftipay.com/docs/api/fiat-orders "End-to-end flow"):
 *  1. Customer checks out in WooCommerce as normal (order created, status
 *     "pending payment").
 *  2. process_payment() creates a NiftiPay fiat order referencing the WC
 *     order id, and returns a redirect to NiftiPay's hosted payUrl.
 *  3. Customer pays by card on NiftiPay's page; WooCommerce order is left
 *     "on-hold" until we hear otherwise — the browser return redirect is
 *     UI-only and is never trusted to mark an order paid.
 *  4. NiftiPay's webhook (class-niftipay-webhook.php) is the only thing
 *     that transitions the order to Processing/Completed, Cancelled, or
 *     Refunded.
 */

if (!defined('ABSPATH')) {
	exit;
}

class WC_Gateway_Niftipay extends WC_Payment_Gateway {

	/** @var string */
	public $api_key;

	/** @var string */
	public $integration_id;

	/** @var string */
	public $api_base_url;

	/** @var string */
	public $storefront_url;

	public function __construct() {
		$this->id                 = 'niftipay';
		$this->icon               = '';
		$this->has_fields         = false;
		$this->method_title       = __('NiftiPay (Card)', 'niftipay-woocommerce');
		$this->method_description = __('Redirects the customer to a NiftiPay hosted page to pay by card. Order status is reconciled via NiftiPay\'s merchant webhook, not the browser redirect.', 'niftipay-woocommerce');

		$this->supports = array('products', 'refunds');

		$this->init_form_fields();
		$this->init_settings();

		$this->title          = $this->get_option('title');
		$this->description    = $this->get_option('description');
		$this->enabled         = $this->get_option('enabled');
		$this->api_key         = $this->get_option('api_key');
		$this->integration_id  = $this->get_option('integration_id');
		$this->api_base_url    = $this->get_option('api_base_url', 'https://www.niftipay.com');
		$this->storefront_url  = untrailingslashit($this->get_option('storefront_url', ''));

		add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
		add_action('woocommerce_receipt_' . $this->id, array($this, 'receipt_page'));
	}

	public function init_form_fields() {
		$this->form_fields = array(
			'enabled' => array(
				'title'   => __('Enable/Disable', 'niftipay-woocommerce'),
				'type'    => 'checkbox',
				'label'   => __('Enable NiftiPay card payments', 'niftipay-woocommerce'),
				'default' => 'no',
			),
			'title' => array(
				'title'       => __('Title', 'niftipay-woocommerce'),
				'type'        => 'text',
				'description' => __('Shown to the customer at checkout.', 'niftipay-woocommerce'),
				'default'     => __('Credit / Debit Card', 'niftipay-woocommerce'),
				'desc_tip'    => true,
			),
			'description' => array(
				'title'       => __('Description', 'niftipay-woocommerce'),
				'type'        => 'textarea',
				'description' => __('Shown to the customer at checkout, under the title.', 'niftipay-woocommerce'),
				'default'     => __('Pay securely by card. You will be redirected to complete payment.', 'niftipay-woocommerce'),
			),
			'api_key' => array(
				'title'       => __('API Key', 'niftipay-woocommerce'),
				'type'        => 'password',
				'description' => __('Dashboard → Settings → API Keys → Create key. See https://www.niftipay.com/docs/api/api-keys', 'niftipay-woocommerce'),
				'default'     => '',
				'desc_tip'    => false,
			),
			'integration_id' => array(
				'title'       => __('Fiat Integration ID', 'niftipay-woocommerce'),
				'type'        => 'text',
				'description' => __('From Dashboard → Settings → Fiat, or leave blank and click "Auto-create integration" below (requires API key saved first).', 'niftipay-woocommerce'),
				'default'     => '',
				'desc_tip'    => false,
			),
			'auto_create_integration' => array(
				'title'       => __('Auto-create integration', 'niftipay-woocommerce'),
				'type'        => 'title',
				'description' => $this->auto_create_integration_field_html(),
			),
			'api_base_url' => array(
				'title'       => __('API Base URL', 'niftipay-woocommerce'),
				'type'        => 'text',
				'description' => __('Only change this if NiftiPay gives you a different environment URL.', 'niftipay-woocommerce'),
				'default'     => 'https://www.niftipay.com',
			),
			'storefront_url' => array(
				'title'       => __('Headless Storefront URL', 'niftipay-woocommerce'),
				'type'        => 'text',
				'description' => __('The Next.js storefront\'s own domain, e.g. https://longevitypeptides.com — set this so customers land back on YOUR site (order-success / checkout pages) after paying, instead of WooCommerce\'s own pages on the WordPress domain. Leave blank to use WooCommerce\'s default order-received/checkout pages.', 'niftipay-woocommerce'),
				'default'     => '',
				'placeholder' => 'https://longevitypeptides.com',
			),
			'webhook_url' => array(
				'title'       => __('Webhook URL (read-only)', 'niftipay-woocommerce'),
				'type'        => 'title',
				'description' => sprintf(
					/* translators: %s: webhook URL */
					__('NiftiPay delivers order status updates to: <code>%s</code>. Register this as the integration\'s Merchant Webhook URL (the auto-create button above does this for you). This endpoint is public by necessity — NiftiPay calls it server-to-server — but every request is verified against your API key before anything happens; see class-niftipay-webhook.php.', 'niftipay-woocommerce'),
					esc_html(Niftipay_Webhook::webhook_url())
				),
			),
		);
	}

	private function auto_create_integration_field_html() {
		if (empty($this->get_option('api_key'))) {
			return __('Save your API key first, then reload this page to auto-create an integration.', 'niftipay-woocommerce');
		}
		$nonce = wp_create_nonce('niftipay_auto_create_integration');
		return sprintf(
			'<button type="button" class="button" id="niftipay-auto-create-integration" data-nonce="%s">%s</button>
			<span id="niftipay-auto-create-result" style="margin-left:8px;"></span>
			<script>
			document.getElementById("niftipay-auto-create-integration")?.addEventListener("click", function (e) {
				e.preventDefault();
				var btn = e.target, resultEl = document.getElementById("niftipay-auto-create-result");
				btn.disabled = true; resultEl.textContent = "Working...";
				fetch(ajaxurl, {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: "action=niftipay_auto_create_integration&_wpnonce=" + encodeURIComponent(btn.dataset.nonce),
				})
					.then(function (r) { return r.json(); })
					.then(function (json) {
						btn.disabled = false;
						if (json.success) {
							document.getElementById("woocommerce_niftipay_integration_id").value = json.data.integration_id;
							resultEl.textContent = "Created: " + json.data.integration_id + " — click Save changes below.";
						} else {
							resultEl.textContent = "Failed: " + (json.data && json.data.message ? json.data.message : "unknown error");
						}
					})
					.catch(function (err) { btn.disabled = false; resultEl.textContent = "Request failed: " + err; });
			});
			</script>',
			esc_attr($nonce),
			esc_html__('Auto-create integration', 'niftipay-woocommerce')
		);
	}

	public function is_valid_for_use() {
		return !empty($this->api_key) && !empty($this->integration_id);
	}

	public function needs_setup() {
		return !$this->is_valid_for_use();
	}

	private function api_client() {
		return new Niftipay_Api_Client($this->api_key, $this->api_base_url);
	}

	/**
	 * Where the customer lands after a successful payment. If a headless
	 * storefront URL is configured, send them back to OUR site (not the
	 * WordPress domain) with enough info to look the order up — otherwise
	 * fall back to WooCommerce's own order-received page.
	 */
	private function build_return_url($order) {
		if (!$this->storefront_url) {
			return $this->get_return_url($order);
		}
		return add_query_arg(
			array(
				'order'     => $order->get_id(),
				'order_key' => $order->get_order_key(),
			),
			$this->storefront_url . '/order-success'
		);
	}

	/** Where the customer lands after a failed/cancelled payment. */
	private function build_failure_url() {
		if (!$this->storefront_url) {
			return wc_get_checkout_url();
		}
		return $this->storefront_url . '/checkout?payment=failed';
	}

	/**
	 * WooCommerce stores money as a decimal string; NiftiPay's fiat orders
	 * API wants integer minor units (cents). Two-decimal currencies only
	 * here — extend this if you sell in a 0- or 3-decimal currency (see
	 * "Currency minor unit rules" in the NiftiPay docs).
	 */
	private function to_minor_units($amount, $currency) {
		$zero_decimal  = array('JPY', 'KRW', 'VND', 'XAF', 'XOF', 'CLP', 'ISK', 'UGX');
		$three_decimal = array('BHD', 'KWD', 'OMR');
		if (in_array($currency, $zero_decimal, true)) {
			return (int) round((float) $amount);
		}
		if (in_array($currency, $three_decimal, true)) {
			return (int) round((float) $amount * 1000);
		}
		return (int) round((float) $amount * 100);
	}

	/**
	 * Entry point WooCommerce calls when the customer places the order.
	 */
	public function process_payment($order_id) {
		$order = wc_get_order($order_id);
		if (!$order) {
			wc_add_notice(__('Order not found.', 'niftipay-woocommerce'), 'error');
			return array('result' => 'failure');
		}

		if (!$this->is_valid_for_use()) {
			wc_add_notice(__('Card payment is temporarily unavailable. Please try again shortly or contact us.', 'niftipay-woocommerce'), 'error');
			return array('result' => 'failure');
		}

		$currency     = $order->get_currency();
		$amount_cents = $this->to_minor_units($order->get_total(), $currency);

		// The WooCommerce order id is our reference — stable, unique, and
		// exactly what we look the order back up by in the webhook. Reusing
		// it also makes the Idempotency-Key in the API client meaningful: a
		// double-submitted "Place order" click can't create two NiftiPay
		// orders for the same WC order.
		$reference = (string) $order->get_id();

		$response = $this->api_client()->create_fiat_order(array(
			'integrationId'   => $this->integration_id,
			'amountCents'     => $amount_cents,
			'currency'        => $currency,
			'description'     => sprintf(__('Order #%s', 'niftipay-woocommerce'), $order->get_order_number()),
			'reference'       => $reference,
			'email'           => $order->get_billing_email(),
			'returnUrl'       => $this->build_return_url($order),
			'failureUrl'      => $this->build_failure_url(),
		));

		if (!$response['ok'] || empty($response['data']['payUrl'])) {
			$error = isset($response['data']['error']) ? $response['data']['error'] : __('Unknown error creating payment.', 'niftipay-woocommerce');
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions -- logged via WC_Logger below, not echoed.
			wc_get_logger()->error(
				sprintf('NiftiPay create_fiat_order failed for order %d: %s (HTTP %d)', $order_id, $error, $response['status']),
				array('source' => 'niftipay')
			);
			wc_add_notice(sprintf(__('Payment could not be started: %s', 'niftipay-woocommerce'), $error), 'error');
			return array('result' => 'failure');
		}

		$niftipay_order = $response['data']['order'];

		// orderKey is the short numeric id used for all later GET/cancel/refund
		// calls; pspOrderId/id are kept for support-ticket / audit purposes.
		$order->update_meta_data('_niftipay_order_key', $niftipay_order['orderKey']);
		$order->update_meta_data('_niftipay_order_id', $niftipay_order['id']);
		$order->update_meta_data('_niftipay_reference', $reference);
		// "On hold" deliberately does NOT reduce stock — WooCommerce only
		// triggers wc_maybe_reduce_stock_levels() on the processing/completed
		// transition, which payment_complete() fires in the webhook handler
		// once NiftiPay actually confirms payment. Carts that never complete
		// checkout never touch stock.
		$order->update_status('on-hold', __('Awaiting NiftiPay card payment confirmation.', 'niftipay-woocommerce'));
		$order->save();

		WC()->cart->empty_cart();

		return array(
			'result'   => 'success',
			'redirect' => $response['data']['payUrl'],
		);
	}

	/**
	 * WooCommerce refund hook (Orders screen → Refund). Delegates to
	 * NiftiPay's partial/multiple refund support.
	 */
	public function process_refund($order_id, $amount = null, $reason = '') {
		$order = wc_get_order($order_id);
		if (!$order) {
			return new WP_Error('niftipay_refund', __('Order not found.', 'niftipay-woocommerce'));
		}

		$order_key = $order->get_meta('_niftipay_order_key');
		if (!$order_key) {
			return new WP_Error('niftipay_refund', __('This order has no associated NiftiPay payment.', 'niftipay-woocommerce'));
		}

		$currency     = $order->get_currency();
		$amount_cents = $this->to_minor_units($amount !== null ? $amount : $order->get_total(), $currency);

		$response = $this->api_client()->refund_fiat_order($order_key, $amount_cents, $reason);

		if (!$response['ok']) {
			$error = isset($response['data']['error']) ? $response['data']['error'] : __('Refund failed.', 'niftipay-woocommerce');
			return new WP_Error('niftipay_refund', $error);
		}

		$order->add_order_note(sprintf(
			/* translators: 1: amount, 2: currency */
			__('Refunded %1$s %2$s via NiftiPay.', 'niftipay-woocommerce'),
			wc_format_decimal($amount_cents / 100, 2),
			$currency
		));

		return true;
	}
}
