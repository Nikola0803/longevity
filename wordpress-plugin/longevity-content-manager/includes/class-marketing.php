<?php
/**
 * Marketing integrations that need a server-side secret and so can't live in
 * the React app: Omnisend contact sync on signup. Reads its API key from
 * the database (set via this plugin's own admin page - Settings API, no
 * file access needed) with a wp-config.php constant as a fallback for hosts
 * that lock file edits down.
 *
 * Split into its own file (rather than folded into class-auth.php) since
 * it's a distinct concern - marketing plumbing, not auth - that class-auth.php
 * reaches into via a direct call, without needing to know this credential exists.
 *
 * Deliberately does NOT include any Meta/Facebook pixel or Google
 * tag/analytics integration - this site's WooCommerce backend is shared
 * infrastructure with the Longevity Peptides storefront, and firing the same
 * ad-platform pixel/tag from both sites would mix their traffic and
 * conversion data together under one ad account. Add a site-specific pixel
 * directly in index.html (or GTM) if/when this site gets its own, distinct
 * ad-tracking setup.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class LPCM_Marketing {

	public static function init() {
		add_action( 'admin_menu', [ __CLASS__, 'add_menu' ] );
	}

	public static function add_menu() {
		add_submenu_page(
			'longevity-content-manager',
			'Longevity Peptides Marketing Integrations',
			'Marketing',
			'manage_options',
			'longevity-marketing',
			[ __CLASS__, 'render' ]
		);
	}

	// ── Omnisend contact sync ───────────────────────────────────────────────

	/**
	 * Resolves the Omnisend API key: database option (set via this admin
	 * page) takes priority, wp-config.php's LPCM_OMNISEND_API_KEY
	 * constant is the fallback. This key is Contacts-scope only - keep it
	 * that way, no reason for this integration to ever touch
	 * campaigns/automations access.
	 */
	public static function omnisend_api_key(): string {
		$key = get_option( 'lpcm_omnisend_api_key', '' );
		if ( ! $key && defined( 'LPCM_OMNISEND_API_KEY' ) ) {
			$key = LPCM_OMNISEND_API_KEY;
		}
		return $key;
	}

	/**
	 * Pushes an explicit email opt-in straight to Omnisend's own Contacts
	 * API - see https://api-docs.omnisend.com/v3/reference/post-contacts.
	 * This bypasses whatever the Omnisend WooCommerce plugin's own
	 * checkout/registration-form checkbox listens for (it reads its own
	 * $_POST field on native WC forms, which never fires for signups
	 * created through this headless REST endpoint). Fire-and-forget: a
	 * failure here must never block account creation, so errors are
	 * logged, not thrown.
	 */
	public static function omnisend_subscribe( string $email, string $first_name = '' ): void {
		$api_key = self::omnisend_api_key();
		if ( ! $api_key ) {
			error_log( 'Longevity Content Manager: no Omnisend API key saved (Longevity Peptides Content Manager -> Marketing admin page) - skipped opt-in sync for ' . $email );
			return;
		}

		$body = [
			'identifiers' => [ [
				'type'     => 'email',
				'id'       => $email,
				'channels' => [
					'email' => [
						'status'     => 'subscribed',
						'statusDate' => gmdate( 'Y-m-d\TH:i:s\Z' ),
					],
				],
			] ],
			'tags' => [ 'source: longevity-signup' ],
		];
		if ( $first_name ) {
			$body['firstName'] = $first_name;
		}

		$res = wp_remote_post( 'https://api.omnisend.com/v3/contacts', [
			'headers' => [
				'Content-Type' => 'application/json',
				'X-API-KEY'    => $api_key,
			],
			'body'    => wp_json_encode( $body ),
			'timeout' => 10,
		] );

		if ( is_wp_error( $res ) ) {
			error_log( 'Longevity Content Manager: Omnisend opt-in sync failed for ' . $email . ' - ' . $res->get_error_message() );
		} elseif ( wp_remote_retrieve_response_code( $res ) >= 300 ) {
			error_log( 'Longevity Content Manager: Omnisend opt-in sync rejected for ' . $email . ' - HTTP ' . wp_remote_retrieve_response_code( $res ) . ' ' . wp_remote_retrieve_body( $res ) );
		}
	}

	// ── Admin page ──────────────────────────────────────────────────────────

	public static function render() {
		$omnisend_saved = false;
		if ( isset( $_POST['lpcm_save_omnisend'] ) && check_admin_referer( 'lpcm_save_omnisend' ) ) {
			$key = trim( $_POST['lpcm_omnisend_key'] ?? '' );
			if ( $key !== '' ) {
				update_option( 'lpcm_omnisend_api_key', $key );
			}
			$omnisend_saved = true;
		}

		$omnisend_has_key = (bool) get_option( 'lpcm_omnisend_api_key', '' );
		?>
		<div class="wrap">
			<h1>Longevity Peptides Marketing Integrations</h1>

			<div style="background:#fff;border:1px solid #e0e0e0;padding:24px;max-width:640px;margin:20px 0 0;border-radius:4px;">
				<h2 style="margin-top:0;">✉️ Omnisend API Key</h2>
				<p style="font-size:13px;color:#555;margin:0 0 16px;">
					Used only to mark a new signup subscribed when they check the "email me" box on
					account creation — Contacts scope only. No wp-config.php edit needed.
				</p>

				<?php if ( $omnisend_saved ) : ?>
					<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px 16px;border-radius:4px;margin-bottom:16px;">
						<p style="font-weight:700;color:#166534;margin:0;">✅ Saved. New signups who opt in will sync from here on.</p>
					</div>
				<?php endif; ?>

				<form method="post">
					<?php wp_nonce_field( 'lpcm_save_omnisend' ); ?>
					<input type="hidden" name="lpcm_save_omnisend" value="1">
					<table class="form-table" style="margin:0 0 16px;">
						<tr>
							<th style="width:140px;padding-left:0;">API Key</th>
							<td>
								<input type="password" name="lpcm_omnisend_key" value="" placeholder="<?php echo $omnisend_has_key ? '••••••••  (already saved — leave blank to keep it)' : '6a38e90bcf34331db96b7c1d-...'; ?>" style="width:100%;max-width:480px;">
							</td>
						</tr>
					</table>
					<button type="submit" class="button button-primary" style="font-size:14px;height:38px;padding:0 20px;background:#0ea5e9;border-color:#0284c7;">
						💾 Save Omnisend Key
					</button>
				</form>
			</div>
		</div>
		<?php
	}
}
