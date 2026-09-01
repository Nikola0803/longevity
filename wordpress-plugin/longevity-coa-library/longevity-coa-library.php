<?php
/**
 * Plugin Name: Longevity Peptides COA Library
 * Plugin URI:  https://longevitytech-lab.com
 * Description: Live, admin-editable Certificate of Analysis (COA) library for the Longevity Peptides storefront (a Next.js app hosted separately, talking to this site over REST) - powers COA browsing, batch verification, and per-product QR targets. Extracted from a prior CMS plugin down to just the COA piece, so this site isn't carrying homepage/FAQ/blog/order-panel content management it doesn't use - see the longevity-content-manager plugin for that.
 * Version:     1.1.0
 * Author:      Longevity Peptides
 * Text Domain: longevity-coa-library
 * Requires WP: 6.0
 * Requires PHP: 8.0
 */

defined( 'ABSPATH' ) || exit;

define( 'LPCOA_VERSION', '1.1.0' );
define( 'LPCOA_DIR', plugin_dir_path( __FILE__ ) );
define( 'LPCOA_URL', plugin_dir_url( __FILE__ ) );

require_once LPCOA_DIR . 'includes/class-lpcoa-post-type.php';
require_once LPCOA_DIR . 'includes/class-lpcoa-rest-api.php';
require_once LPCOA_DIR . 'includes/class-lpcoa-admin.php';

add_action( 'plugins_loaded', function () {
	LPCOA_Post_Type::init();
	LPCOA_REST_API::init();
	LPCOA_Admin::init();
} );

register_activation_hook( __FILE__, function () {
	LPCOA_Post_Type::register();
	flush_rewrite_rules();
} );

register_deactivation_hook( __FILE__, 'flush_rewrite_rules' );
