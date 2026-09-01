<?php
/**
 * Plugin Name: Longevity Peptides Content Manager
 * Plugin URI:  https://longevitytech-lab.com
 * Description: Editable site content (CMS), headless auth, guest-order linking, marketing, and product-data tools for the Longevity Peptides storefront (a Next.js app hosted separately, talking to this site over REST). Also carries an optional built-in SPA router/uploader (upload a Vite/CRA dist/ zip and flip on "SPA takeover") for the rare case this WordPress install needs to serve the frontend directly instead - stays off unless explicitly enabled, and isn't needed for the current Next.js deployment.
 * Version:     2.2.0
 * Author:      Longevity Peptides
 * Text Domain: longevity-content-manager
 * Requires WP: 6.0
 * Requires PHP: 8.0
 */

defined( 'ABSPATH' ) || exit;

define( 'LPCM_VERSION', '2.2.0' );
define( 'LPCM_PLUGIN_FILE', __FILE__ );
define( 'LPCM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'LPCM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'LPCM_DIST_DIR', LPCM_PLUGIN_DIR . 'dist/' );
define( 'LPCM_DIST_URL', LPCM_PLUGIN_URL . 'dist/' );

function lpcm_require_includes() {
	$includes = [
		'includes/class-uploader.php',
		'includes/class-spa-router.php',
		'includes/class-cors.php',
		'includes/class-auth.php',
		'includes/class-settings.php',
		'includes/class-marketing.php',
		'includes/class-order-hooks.php',
		'includes/class-product-tools.php',
		'includes/class-cms.php',
	];
	foreach ( $includes as $file ) {
		$path = LPCM_PLUGIN_DIR . $file;
		if ( file_exists( $path ) ) {
			require_once $path;
		}
	}
}
lpcm_require_includes();

function lpcm_init_plugin() {
	LPCM_Uploader::init();
	LPCM_SPA_Router::init();
	LPCM_Cors::init();
	LPCM_Auth::init();
	LPCM_Settings::init();
	LPCM_Marketing::init();
	LPCM_Order_Hooks::init();
	LPCM_Product_Tools::init();
	LPCM_CMS::init();
}
add_action( 'plugins_loaded', 'lpcm_init_plugin', 1 );

function lpcm_activate() {
	if ( ! file_exists( LPCM_DIST_DIR ) ) {
		wp_mkdir_p( LPCM_DIST_DIR );
	}
	// Deliberately does NOT enable SPA takeover on activation - stays off
	// until an admin uploads a real build and flips it on, so installing
	// (or updating) this plugin can never immediately break the live site.
	// Also flushes rewrite rules so /wp-json/longevity/v1/* resolves.
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'lpcm_activate' );

function lpcm_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'lpcm_deactivate' );
