<?php
/**
 * Plugin Name: NiftiPay for WooCommerce
 * Plugin URI: https://www.niftipay.com/docs/plugins/woocommerce
 * Description: Accept fiat card payments via NiftiPay in WooCommerce. Creates a hosted NiftiPay fiat order at checkout, redirects the customer to pay, and reconciles order status via NiftiPay's merchant webhook.
 * Version: 1.0.0
 * Requires PHP: 7.4
 * Requires Plugins: woocommerce
 * WC requires at least: 6.0
 * Author: Longevity Peptides
 * Text Domain: niftipay-woocommerce
 *
 * Built against NiftiPay's Fiat Orders API (https://www.niftipay.com/docs/api/fiat-orders)
 * and API Guidelines (https://www.niftipay.com/docs/api/api-guidelines) as documented
 * at integration time. NiftiPay processes the card charge; WooCommerce remains the
 * system of record for the order — this plugin never stores card details.
 */

if (!defined('ABSPATH')) {
	exit; // No direct access.
}

define('NIFTIPAY_WC_VERSION', '1.0.0');
define('NIFTIPAY_WC_PLUGIN_FILE', __FILE__);
define('NIFTIPAY_WC_PLUGIN_DIR', plugin_dir_path(__FILE__));

/**
 * Bail (with an admin notice) if WooCommerce isn't active, rather than fatal-erroring
 * on the WC_Payment_Gateway base class not existing.
 */
function niftipay_wc_missing_woocommerce_notice() {
	echo '<div class="notice notice-error"><p>';
	echo esc_html__('NiftiPay for WooCommerce requires WooCommerce to be installed and active.', 'niftipay-woocommerce');
	echo '</p></div>';
}

function niftipay_wc_init() {
	if (!class_exists('WooCommerce')) {
		add_action('admin_notices', 'niftipay_wc_missing_woocommerce_notice');
		return;
	}

	require_once NIFTIPAY_WC_PLUGIN_DIR . 'includes/class-niftipay-api-client.php';
	require_once NIFTIPAY_WC_PLUGIN_DIR . 'includes/class-wc-gateway-niftipay.php';
	require_once NIFTIPAY_WC_PLUGIN_DIR . 'includes/class-niftipay-webhook.php';

	Niftipay_Webhook::init();

	add_filter('woocommerce_payment_gateways', function ($gateways) {
		$gateways[] = 'WC_Gateway_Niftipay';
		return $gateways;
	});
}
add_action('plugins_loaded', 'niftipay_wc_init');

/**
 * Declare High-Performance Order Storage (HPOS) compatibility so the plugin
 * doesn't get flagged incompatible on stores that have it enabled.
 */
add_action('before_woocommerce_init', function () {
	if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
			'custom_order_tables',
			__FILE__,
			true
		);
	}
});

/**
 * Settings link on the Plugins list page.
 */
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($links) {
	$settings_url = admin_url('admin.php?page=wc-settings&tab=checkout&section=niftipay');
	array_unshift($links, '<a href="' . esc_url($settings_url) . '">' . esc_html__('Settings', 'niftipay-woocommerce') . '</a>');
	return $links;
});
