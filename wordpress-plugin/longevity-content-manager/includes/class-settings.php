<?php
/**
 * Site-wide settings the frontend reads at /wp-json/longevity/v1/settings -
 * currently just the free-shipping threshold (the storefront's site-settings hook
 * merges whatever JSON comes back over its own defaults, so any additional
 * key added here just works on the frontend with no code change there).
 *
 * A deliberately small stand-in for a full CMS options class,
 * which manages a much broader set of settings (homepage hero copy,
 * payment-method display info, contact details, trust badges) that this
 * site's frontend doesn't read from wp-admin at all - those are still
 * hardcoded in the Next.js frontend, so
 * porting a full CMS options screen here would just be dead admin UI.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class LPCM_Settings {

	const OPTION_KEY = 'lpcm_site_settings';

	public static function init() {
		add_action( 'rest_api_init', [ __CLASS__, 'register_routes' ] );
		add_action( 'admin_menu', [ __CLASS__, 'add_menu' ] );
	}

	public static function defaults(): array {
		return [
			'free_shipping_threshold' => 0, // 0 disables the cart's free-shipping progress bar
		];
	}

	public static function get(): array {
		$saved = get_option( self::OPTION_KEY, [] );
		return array_replace_recursive( self::defaults(), (array) $saved );
	}

	public static function save( array $data ): bool {
		$merged = array_replace_recursive( self::get(), $data );
		return update_option( self::OPTION_KEY, $merged );
	}

	public static function register_routes() {
		register_rest_route( 'longevity/v1', '/settings', [
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ __CLASS__, 'rest_get' ],
				'permission_callback' => '__return_true', // public - frontend reads it
			],
			[
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => [ __CLASS__, 'rest_save' ],
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			],
		] );
	}

	public static function rest_get(): WP_REST_Response {
		return new WP_REST_Response( self::get(), 200 );
	}

	public static function rest_save( WP_REST_Request $req ): WP_REST_Response {
		$data = $req->get_json_params();
		if ( empty( $data ) ) {
			return new WP_REST_Response( [ 'error' => 'No data provided' ], 400 );
		}
		self::save( $data );
		return new WP_REST_Response( self::get(), 200 );
	}

	public static function add_menu() {
		add_submenu_page(
			'longevity-content-manager',
			'Longevity Peptides Site Settings',
			'Site Settings',
			'manage_options',
			'longevity-settings',
			[ __CLASS__, 'render' ]
		);
	}

	public static function render() {
		if ( isset( $_POST['lpcm_save_settings'] ) && check_admin_referer( 'lpcm_save_settings' ) ) {
			self::save( [ 'free_shipping_threshold' => (float) ( $_POST['free_shipping_threshold'] ?? 0 ) ] );
			update_option( 'lpcm_storefront_origin', untrailingslashit( esc_url_raw( trim( $_POST['lpcm_storefront_origin'] ?? '' ) ) ) );
			echo '<div class="notice notice-success is-dismissible"><p>Saved.</p></div>';
		}

		$settings = self::get();
		$storefront_origin = get_option( 'lpcm_storefront_origin', '' );
		?>
		<div class="wrap">
			<h1>Longevity Peptides Site Settings</h1>
			<div style="background:#fff;border:1px solid #e0e0e0;padding:24px;max-width:640px;margin:20px 0 0;border-radius:4px;">
				<form method="post">
					<?php wp_nonce_field( 'lpcm_save_settings' ); ?>
					<table class="form-table" style="margin:0 0 16px;">
						<tr>
							<th style="width:220px;padding-left:0;">Free shipping threshold ($)</th>
							<td>
								<input type="number" step="0.01" min="0" name="free_shipping_threshold" value="<?php echo esc_attr( $settings['free_shipping_threshold'] ); ?>" style="width:140px;">
								<p class="description">Orders at or above this subtotal show "You qualify for free shipping" in the cart. Set to 0 to hide the free-shipping progress bar entirely.</p>
							</td>
						</tr>
						<tr>
							<th style="width:220px;padding-left:0;">Storefront origin (CORS)</th>
							<td>
								<input type="url" name="lpcm_storefront_origin" value="<?php echo esc_attr( $storefront_origin ); ?>" style="width:100%;max-width:420px;" placeholder="https://longevitypeptides.com">
								<p class="description">The exact origin (scheme + domain, no trailing path) the Vite storefront is served from. Required for the browser to be allowed to call the WooCommerce Store API (cart/checkout) and this plugin's REST routes cross-origin with cookies. Same value as the NiftiPay gateway's "Headless Storefront URL" setting.</p>
							</td>
						</tr>
					</table>
					<button type="submit" name="lpcm_save_settings" value="1" class="button button-primary">Save</button>
				</form>
			</div>
		</div>
		<?php
	}
}
