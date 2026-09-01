<?php
/**
 * Thin wrapper around NiftiPay's REST API (fiat orders + integrations).
 * https://www.niftipay.com/docs/api/fiat-orders
 */

if (!defined('ABSPATH')) {
	exit;
}

class Niftipay_Api_Client {

	/** @var string */
	private $api_key;

	/** @var string */
	private $base_url;

	public function __construct($api_key, $base_url = 'https://www.niftipay.com') {
		$this->api_key  = $api_key;
		$this->base_url = untrailingslashit($base_url);
	}

	/**
	 * @param string $method GET|POST|PATCH|DELETE
	 * @param string $path   e.g. "/api/fiat/orders"
	 * @param array|null $body
	 * @return array{ok:bool,status:int,data:array,raw:string}
	 */
	private function request($method, $path, $body = null, $extra_headers = array()) {
		$url = $this->base_url . $path;

		$headers = array_merge(array(
			'x-api-key'    => $this->api_key,
			'Accept'       => 'application/json',
			'Content-Type' => 'application/json',
		), $extra_headers);

		$args = array(
			'method'  => $method,
			'headers' => $headers,
			'timeout' => 20, // NiftiPay docs recommend a 10-20s client timeout.
		);

		if (null !== $body) {
			$args['body'] = wp_json_encode($body);
		}

		$response = wp_remote_request($url, $args);

		if (is_wp_error($response)) {
			return array(
				'ok'     => false,
				'status' => 0,
				'data'   => array('error' => $response->get_error_message()),
				'raw'    => '',
			);
		}

		$status = wp_remote_retrieve_response_code($response);
		$raw    = wp_remote_retrieve_body($response);
		$data   = json_decode($raw, true);
		if (!is_array($data)) {
			$data = array();
		}

		return array(
			'ok'     => $status >= 200 && $status < 300,
			'status' => $status,
			'data'   => $data,
			'raw'    => $raw,
		);
	}

	/**
	 * GET /api/fiat/integrations — used by the admin settings page to let the
	 * merchant pick/verify an integration without leaving WordPress.
	 */
	public function list_integrations() {
		return $this->request('GET', '/api/fiat/integrations');
	}

	/**
	 * POST /api/fiat/integrations — auto-provision an integration pointed at
	 * this site's webhook endpoint the first time the gateway is configured,
	 * so the merchant doesn't have to hand-copy an integration ID.
	 */
	public function create_integration($name, $return_url, $failure_url, $webhook_url) {
		return $this->request('POST', '/api/fiat/integrations', array(
			'name'               => $name,
			'returnUrl'          => $return_url,
			'failureUrl'         => $failure_url,
			'merchantWebhookUrl' => $webhook_url,
		));
	}

	/**
	 * POST /api/fiat/orders — create a hosted-checkout fiat order.
	 *
	 * $args: integrationId, amountCents, currency, description, reference,
	 *        serviceFeePayer, email, returnUrl, failureUrl
	 */
	public function create_fiat_order($args) {
		// Idempotency-Key keyed on our own order reference, per NiftiPay's
		// retry guidance — a WooCommerce checkout retry (double-submit,
		// network blip) reuses the same reference and gets the same order
		// back instead of a 409 or a duplicate charge.
		$headers = array();
		if (!empty($args['reference'])) {
			$headers['Idempotency-Key'] = 'wc-' . $args['reference'];
		}
		return $this->request('POST', '/api/fiat/orders', $args, $headers);
	}

	/** GET /api/fiat/orders/:orderKey */
	public function get_fiat_order($order_key) {
		return $this->request('GET', '/api/fiat/orders/' . rawurlencode($order_key));
	}

	/** DELETE /api/fiat/orders/:orderKey/cancel-equivalent — cancel by orderKey. */
	public function cancel_fiat_order($order_key) {
		return $this->request('DELETE', '/api/fiat/orders/' . rawurlencode($order_key));
	}

	/** POST /api/fiat/orders/:orderKey/refunds */
	public function refund_fiat_order($order_key, $amount_cents, $description = '') {
		return $this->request('POST', '/api/fiat/orders/' . rawurlencode($order_key) . '/refunds', array_filter(array(
			'amountCents' => $amount_cents,
			'description' => $description,
		)));
	}

	/** GET /api/payment-methods — used by the settings page to confirm fiat is enabled. */
	public function get_payment_methods() {
		return $this->request('GET', '/api/payment-methods');
	}
}
