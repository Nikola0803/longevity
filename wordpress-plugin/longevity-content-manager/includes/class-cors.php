<?php
/**
 * CORS for the Store API (cart/checkout) and this plugin's own REST
 * routes, so the Vite SPA storefront — hosted on its own domain, not this
 * WordPress install — can call them with `credentials: "include"` (needed
 * to carry the Woo session cookie through add-to-cart/checkout).
 *
 * `Access-Control-Allow-Origin: *` does not work for credentialed
 * requests (browsers reject it outright), so this echoes back the exact
 * configured storefront origin instead. Reuses the same `storefront_url`
 * setting the NiftiPay gateway already has (WooCommerce Payment Gateways
 * -> NiftiPay -> Headless Storefront URL) so there's only one place to
 * configure the frontend's URL.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class LPCM_Cors {

	public static function init() {
		add_action( 'rest_api_init', [ __CLASS__, 'add_cors_headers' ], 15 );
	}

	private static function allowed_origin(): string {
		// Prefer this plugin's own setting; fall back to the NiftiPay
		// gateway's storefront_url if this one hasn't been set yet, so a
		// site that only configured the payment gateway still gets CORS.
		$origin = get_option( 'lpcm_storefront_origin', '' );
		if ( ! $origin ) {
			$niftipay_settings = get_option( 'woocommerce_niftipay_settings', [] );
			$origin = is_array( $niftipay_settings ) ? ( $niftipay_settings['storefront_url'] ?? '' ) : '';
		}
		return $origin ? untrailingslashit( $origin ) : '';
	}

	public static function add_cors_headers() {
		remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
		add_filter( 'rest_pre_serve_request', function ( $value ) {
			// The public catalog read (GET /longevity/v1/catalog) carries no
			// cookies/credentials and returns nothing but published product
			// data, so it's safe to allow from any origin - the storefront
			// domain doesn't need to be configured first just to list
			// products. Cart/checkout (Store API) still needs the strict,
			// single-origin, credentialed CORS below: that's what actually
			// carries the Woo session cookie.
			if ( isset( $_SERVER['REQUEST_URI'] ) && strpos( $_SERVER['REQUEST_URI'], '/wp-json/longevity/v1/catalog' ) !== false ) {
				header( 'Access-Control-Allow-Origin: *' );
				header( 'Access-Control-Allow-Methods: GET' );
				return $value;
			}

			$allowed = self::allowed_origin();
			$request_origin = get_http_origin();

			if ( $allowed && $request_origin && strcasecmp( $allowed, untrailingslashit( $request_origin ) ) === 0 ) {
				header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $request_origin ) );
				header( 'Access-Control-Allow-Credentials: true' );
				header( 'Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS' );
				header( 'Access-Control-Allow-Headers: Content-Type, X-WP-Nonce, Nonce' );
				header( 'Access-Control-Expose-Headers: X-WC-Store-API-Nonce, Nonce' );
			}

			return $value;
		} );
	}
}
