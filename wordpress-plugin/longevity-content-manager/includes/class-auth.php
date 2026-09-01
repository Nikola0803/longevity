<?php
/**
 * Auth REST API - /wp-json/longevity/v1/register|login|validate
 *
 * Simple HMAC-signed token auth for the headless React storefront (not
 * WordPress cookie auth - the SPA can't rely on cookies across the API
 * boundary the same way a theme would). Tokens are signed with the site's
 * own AUTH_KEY, so no secret needs managing separately from wp-config.php.
 *
 * Logic unchanged from the pre-rewrite longevity-content-manager.php - only moved
 * into its own file as part of splitting the plugin into aera-style
 * includes/ modules.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class LPCM_Auth {

	public static function init() {
		// Registered on rest_api_init (fires during WP's init hook, after
		// plugins_loaded). Explicit priority 10 so it fires after WC
		// registers its own routes.
		add_action( 'rest_api_init', [ __CLASS__, 'register_routes' ], 10 );

		// Covers logins/registrations that happen outside this plugin's own
		// /login and /register REST routes (native wp-login.php, another
		// plugin, etc). The REST /login route calls
		// link_guest_orders_to_customer() directly too, since login()
		// authenticates via wp_authenticate() rather than wp_signon(), which
		// never fires 'wp_login'.
		add_action( 'wp_login', function ( string $user_login, WP_User $user ) {
			self::link_guest_orders_to_customer( $user->ID );
		}, 10, 2 );
		add_action( 'user_register', function ( int $user_id ) {
			self::link_guest_orders_to_customer( $user_id );
		} );

		add_action( 'admin_menu', [ __CLASS__, 'add_menu' ] );
		add_action( 'admin_post_lpcm_link_all_guest_orders', [ __CLASS__, 'handle_link_all' ] );
	}

	public static function add_menu() {
		add_submenu_page(
			'longevity-content-manager',
			'Longevity Peptides Guest Order Linking',
			'Guest Order Linking',
			'manage_options',
			'longevity-guest-orders',
			[ __CLASS__, 'render_admin_page' ]
		);
	}

	/**
	 * WooCommerce's own wc_update_new_customer_past_orders() only runs once,
	 * at the exact moment an account is first created, and only catches
	 * guest orders that already existed at that instant. It never revisits
	 * guest orders placed *later* under the same email while still not
	 * logged in - which is exactly the gap here: someone registers, never
	 * logs back in, then checks out as a guest one or more times with the
	 * same email. Those orders stay permanently unattached to the account
	 * unless something re-checks.
	 *
	 * This re-checks on every login and every registration (see init()
	 * above), plus there's a one-off admin sweep (link_all_guest_orders())
	 * for orders placed before this shipped.
	 */
	public static function link_guest_orders_to_customer( int $user_id ): int {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return 0;
		}

		$user = get_userdata( $user_id );
		if ( ! $user || ! $user->user_email ) {
			return 0;
		}

		$orders = wc_get_orders( [
			'limit'         => -1,
			'billing_email' => $user->user_email,
			'return'        => 'objects',
		] );

		$linked = 0;
		foreach ( $orders as $order ) {
			if ( $order->get_customer_id() > 0 ) {
				continue; // already attached to an account
			}
			// Belt-and-suspenders exact check, independent of whether the
			// billing_email query arg above actually filtered anything.
			if ( strcasecmp( $order->get_billing_email(), $user->user_email ) !== 0 ) {
				continue;
			}

			$order->set_customer_id( $user_id );
			$order->save();
			$linked++;
		}

		return $linked;
	}

	/** One-off retroactive sweep - links every existing guest order to any account whose email matches. Safe to run more than once. */
	public static function link_all_guest_orders(): array {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return [ [ 'ok' => false, 'msg' => 'WooCommerce is not active.' ] ];
		}

		$users   = get_users( [ 'fields' => [ 'ID', 'user_email' ] ] );
		$results = [];
		$total   = 0;

		foreach ( $users as $u ) {
			$count = self::link_guest_orders_to_customer( $u->ID );
			if ( $count > 0 ) {
				$total     += $count;
				$results[]  = [ 'ok' => true, 'msg' => "{$u->user_email} — linked {$count} guest order(s)." ];
			}
		}

		if ( $total === 0 ) {
			$results[] = [ 'ok' => true, 'msg' => 'No unlinked guest orders found matching any existing account.' ];
		} else {
			$results[] = [ 'ok' => true, 'msg' => "Total: {$total} order(s) linked across " . count( array_filter( $results, fn( $r ) => $r['ok'] ) ) . ' account(s).' ];
		}

		return $results;
	}

	public static function handle_link_all() {
		if ( ! current_user_can( 'manage_options' ) || ! check_admin_referer( 'lpcm_link_all_guest_orders' ) ) {
			wp_die( 'Not allowed.' );
		}
		set_transient( 'lpcm_link_all_guest_orders_results', self::link_all_guest_orders(), MINUTE_IN_SECONDS * 5 );
		wp_safe_redirect( admin_url( 'admin.php?page=longevity-guest-orders&linked=1' ) );
		exit;
	}

	public static function render_admin_page() {
		$results = isset( $_GET['linked'] ) ? get_transient( 'lpcm_link_all_guest_orders_results' ) : null;
		?>
		<div class="wrap">
			<h1>🔗 Link Guest Orders to Accounts</h1>
			<div style="background:#fff;border:1px solid #e0e0e0;padding:24px;max-width:640px;margin:20px 0 0;border-radius:4px;">
				<p style="font-size:13px;color:#555;margin:0 0 16px;">
					This now happens automatically on every login and every new registration - any
					guest-checkout order whose billing email matches a registered account gets
					attached to that account, so it shows up in their order history. This button is
					the one-time catch-up for orders placed <em>before</em> that was in place: it
					scans every account and attaches any matching guest orders right now, no login
					required. Safe to run more than once - already-linked orders are skipped.
				</p>

				<?php if ( $results !== null && $results !== false ) : ?>
					<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:4px;margin-bottom:16px;max-height:320px;overflow-y:auto;">
						<p style="font-weight:700;color:#166534;margin:0 0 10px;">Done!</p>
						<?php foreach ( $results as $r ) :
							$color = $r['ok'] ? '#15803d' : '#b45309'; ?>
							<div style="font-family:monospace;font-size:12px;color:<?php echo esc_attr( $color ); ?>;margin-bottom:3px;">
								<?php echo $r['ok'] ? '✅' : '⚠️'; ?> <?php echo esc_html( $r['msg'] ); ?>
							</div>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>

				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
					<input type="hidden" name="action" value="lpcm_link_all_guest_orders" />
					<?php wp_nonce_field( 'lpcm_link_all_guest_orders' ); ?>
					<button type="submit" class="button button-primary" style="font-size:14px;height:38px;padding:0 20px;background:#0ea5e9;border-color:#0284c7;">
						🔗 Link All Guest Orders to Matching Accounts
					</button>
				</form>
			</div>
		</div>
		<?php
	}

	public static function register_routes() {
		register_rest_route( 'longevity/v1', '/register', [
			'methods'             => 'POST',
			'callback'            => [ __CLASS__, 'register' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'email'            => [ 'required' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_email' ],
				'password'         => [ 'required' => true, 'type' => 'string' ],
				'username'         => [ 'required' => false, 'type' => 'string', 'sanitize_callback' => 'sanitize_user' ],
				'marketing_opt_in' => [ 'required' => false, 'type' => 'boolean', 'default' => false ],
			],
		] );

		register_rest_route( 'longevity/v1', '/login', [
			'methods'             => 'POST',
			'callback'            => [ __CLASS__, 'login' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'email'    => [ 'required' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_email' ],
				'password' => [ 'required' => true, 'type' => 'string' ],
			],
		] );

		register_rest_route( 'longevity/v1', '/validate', [
			'methods'             => 'POST',
			'callback'            => [ __CLASS__, 'validate' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'token' => [ 'required' => true, 'type' => 'string' ],
			],
		] );
	}

	/** Generate a signed token for a given user ID. Format: base64(user_id.'|'.expires).'.'.hmac */
	public static function make_token( int $user_id ): string {
		$expires = time() + ( 30 * DAY_IN_SECONDS ); // 30-day token
		$payload = base64_encode( $user_id . '|' . $expires );
		$secret  = defined( 'AUTH_KEY' ) ? AUTH_KEY : wp_salt( 'auth' );
		$sig     = hash_hmac( 'sha256', $payload, $secret );
		return $payload . '.' . $sig;
	}

	/** Verify a token. Returns user_id on success, 0 on failure. */
	public static function verify_token( string $token ): int {
		$parts = explode( '.', $token, 2 );
		if ( count( $parts ) !== 2 ) {
			return 0;
		}

		[ $payload, $sig ] = $parts;
		$secret   = defined( 'AUTH_KEY' ) ? AUTH_KEY : wp_salt( 'auth' );
		$expected = hash_hmac( 'sha256', $payload, $secret );

		if ( ! hash_equals( $expected, $sig ) ) {
			return 0;
		}

		$decoded = base64_decode( $payload );
		[ $user_id, $expires ] = explode( '|', $decoded, 2 );

		if ( time() > (int) $expires ) {
			return 0;
		}

		return (int) $user_id;
	}

	public static function register( WP_REST_Request $req ): WP_REST_Response {
		$email    = $req->get_param( 'email' );
		$password = $req->get_param( 'password' );
		$username = $req->get_param( 'username' ) ?: sanitize_user( strstr( $email, '@', true ) );
		$opt_in   = (bool) $req->get_param( 'marketing_opt_in' );

		if ( ! is_email( $email ) ) {
			return new WP_REST_Response( [ 'error' => 'Invalid email address.' ], 400 );
		}
		if ( strlen( $password ) < 8 ) {
			return new WP_REST_Response( [ 'error' => 'Password must be at least 8 characters.' ], 400 );
		}
		if ( email_exists( $email ) ) {
			return new WP_REST_Response( [ 'error' => 'An account with that email already exists.' ], 409 );
		}

		// Make username unique if taken
		$base = $username;
		$i    = 1;
		while ( username_exists( $username ) ) {
			$username = $base . $i++;
		}

		$user_id = wp_create_user( $username, $password, $email );

		if ( is_wp_error( $user_id ) ) {
			return new WP_REST_Response( [ 'error' => $user_id->get_error_message() ], 500 );
		}

		$user = new WP_User( $user_id );
		$user->set_role( 'subscriber' );

		// Record the opt-in on the account itself regardless of whether the
		// Omnisend push below succeeds, so it's never silently lost again
		// and can be re-driven later (e.g. a retry cron) if the API call
		// fails.
		update_user_meta( $user_id, 'marketing_opt_in', $opt_in ? 'yes' : 'no' );
		if ( $opt_in ) {
			LPCM_Marketing::omnisend_subscribe( $email, $username );
		}

		$token = self::make_token( $user_id );

		return new WP_REST_Response( [
			'token'    => $token,
			'user_id'  => $user_id,
			'email'    => $email,
			'username' => $username,
			'message'  => 'Account created successfully.',
		], 201 );
	}

	public static function login( WP_REST_Request $req ): WP_REST_Response {
		$email    = $req->get_param( 'email' );
		$password = $req->get_param( 'password' );

		// Accept login by email - find the username first
		$user = get_user_by( 'email', $email );

		if ( ! $user ) {
			return new WP_REST_Response( [ 'error' => 'No account found with that email.' ], 401 );
		}

		$result = wp_authenticate( $user->user_login, $password );

		if ( is_wp_error( $result ) ) {
			return new WP_REST_Response( [ 'error' => 'Incorrect password.' ], 401 );
		}

		// wp_authenticate() (unlike wp_signon()) never fires the 'wp_login'
		// action, so this route needs its own call to pick up any guest
		// orders placed under this email since the last login.
		self::link_guest_orders_to_customer( $result->ID );

		$token = self::make_token( $result->ID );

		return new WP_REST_Response( [
			'token'    => $token,
			'user_id'  => $result->ID,
			'email'    => $result->user_email,
			'username' => $result->user_login,
			'message'  => 'Login successful.',
		], 200 );
	}

	public static function validate( WP_REST_Request $req ): WP_REST_Response {
		$token   = $req->get_param( 'token' );
		$user_id = self::verify_token( $token );

		if ( ! $user_id ) {
			return new WP_REST_Response( [ 'valid' => false ], 401 );
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return new WP_REST_Response( [ 'valid' => false ], 401 );
		}

		return new WP_REST_Response( [
			'valid'    => true,
			'user_id'  => $user_id,
			'email'    => $user->user_email,
			'username' => $user->user_login,
		], 200 );
	}
}
