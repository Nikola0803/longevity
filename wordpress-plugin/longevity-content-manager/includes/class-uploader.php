<?php
/**
 * Admin page: upload the React app's `npm run build` output as a zip (zip
 * the *contents* of the dist/ folder, so index.html sits at the zip root)
 * and extract it into this plugin's own dist/ folder, then flip SPA
 * takeover on/off. No path rewriting happens here - the router
 * (class-spa-router.php) serves any real file in that folder directly at
 * the same root-relative path it was built with, so a plain `npm run
 * build` output (default Vite base "/") works with zero special
 * configuration on the frontend's side.
 *
 * Same upload/toggle mechanism as the Aera Frontend Loader plugin's
 * class-uploader.php - this is the piece that replaces the old
 * "FTP the dist/ files into app/ by hand" deploy flow.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class LPCM_Uploader {

	public static function init() {
		add_action( 'admin_menu', [ __CLASS__, 'add_menu' ] );
		add_action( 'admin_post_lpcm_upload_dist', [ __CLASS__, 'handle_upload' ] );
		add_action( 'admin_post_lpcm_toggle_takeover', [ __CLASS__, 'handle_toggle' ] );
		add_action( 'admin_notices', [ __CLASS__, 'show_notices' ] );
	}

	public static function add_menu() {
		add_menu_page(
			'Longevity Peptides Content Manager',
			'Longevity Peptides Content Manager',
			'manage_options',
			'longevity-content-manager',
			[ __CLASS__, 'render' ],
			'dashicons-admin-site-alt3',
			55
		);
	}

	private static function has_build() {
		return file_exists( LPCM_DIST_DIR . 'index.html' );
	}

	public static function render() {
		$has_build   = self::has_build();
		$active      = get_option( 'lpcm_takeover_active' );
		$uploaded_at = get_option( 'lpcm_dist_uploaded_at' );

		$asset_count = 0;
		if ( $has_build && is_dir( LPCM_DIST_DIR . 'assets' ) ) {
			$asset_count = count( glob( LPCM_DIST_DIR . 'assets/*' ) );
		}
		?>
		<div class="wrap">
			<h1>🛡 Longevity Peptides Content Manager <span style="font-size:13px;font-weight:400;color:#888;">v<?php echo esc_html( LPCM_VERSION ); ?></span></h1>
			<p class="description">Serves the built React/Vite storefront as this site's actual
				front-end - every non-admin, non-API URL renders the app, and React Router takes
				over from there.</p>

			<?php if ( isset( $_GET['uploaded'] ) ) : ?>
				<div class="notice notice-success is-dismissible"><p>Build uploaded and processed.</p></div>
			<?php elseif ( isset( $_GET['upload_error'] ) ) : ?>
				<div class="notice notice-error is-dismissible"><p><?php echo esc_html( urldecode( $_GET['upload_error'] ) ); ?></p></div>
			<?php endif; ?>

			<h2>1. Upload the build</h2>
			<p>Run <code>npm run build</code> in the React app, then zip the <strong>contents</strong>
				of the <code>dist/</code> folder (so <code>index.html</code> is at the root of the
				zip, not inside a <code>dist/</code> subfolder) and upload it here.</p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" enctype="multipart/form-data">
				<input type="hidden" name="action" value="lpcm_upload_dist" />
				<?php wp_nonce_field( 'lpcm_upload_dist' ); ?>
				<input type="file" name="dist_zip" accept=".zip" required />
				<?php submit_button( 'Upload &amp; install build', 'primary', 'submit', false ); ?>
			</form>

			<?php if ( $has_build ) : ?>
				<div style="background:#fff;border:1px solid #e0e0e0;padding:16px;max-width:640px;margin-top:16px;border-radius:4px;">
					<p style="margin:0 0 6px;color:#16a34a;font-weight:700;">✅ A build is installed<?php echo $uploaded_at ? ' (uploaded ' . esc_html( human_time_diff( $uploaded_at, current_time( 'timestamp' ) ) ) . ' ago)' : ''; ?>.</p>
					<p style="margin:0;font-size:13px;color:#555;">
						<?php echo (int) $asset_count; ?> file(s) in <code>/assets/</code>. Served directly
						from this site's root (e.g. <code><?php echo esc_html( home_url( '/assets/...' ) ); ?></code>),
						exactly as Vite built them.
					</p>
				</div>
			<?php else : ?>
				<p style="margin-top:12px;">No build installed yet.</p>
			<?php endif; ?>

			<h2>2. Enable it</h2>
			<?php if ( ! $has_build ) : ?>
				<p class="description">Upload a build first.</p>
			<?php else : ?>
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
					<input type="hidden" name="action" value="lpcm_toggle_takeover" />
					<?php wp_nonce_field( 'lpcm_toggle_takeover' ); ?>
					<input type="hidden" name="next_state" value="<?php echo $active ? '0' : '1'; ?>" />
					<?php if ( $active ) : ?>
						<p>🟢 <strong>SPA takeover is ON</strong> - this plugin is answering every
							front-end request with the React app.</p>
						<?php submit_button( 'Turn off (restore normal WordPress front-end)', 'secondary', 'submit', false ); ?>
					<?php else : ?>
						<p>⚪ SPA takeover is off - WordPress's normal theme is still serving the
							front-end.</p>
						<?php submit_button( 'Turn on SPA takeover', 'primary', 'submit', false ); ?>
					<?php endif; ?>
				</form>
			<?php endif; ?>

			<h2>How it works</h2>
			<ul style="list-style:disc;padding-left:20px;font-size:13px;color:#444;line-height:1.9;">
				<li>Requests to <code>/wp-admin</code>, <code>/wp-json</code> (REST API - WooCommerce +
					Longevity Peptides endpoints), <code>/wp-login.php</code>, <code>/xmlrpc.php</code>,
					<code>/wp-content</code>, <code>?wc-ajax=</code>, and a handful of other WordPress
					core paths are never touched - WordPress handles those exactly as normal.</li>
				<li>The legacy <code>/product/:slug</code> URL shape 301-redirects to
					<code>/products/:slug</code>, preserving any query string.</li>
				<li>Every other front-end URL (<code>/</code>, <code>/shop</code>,
					<code>/products/bpc-157-10mg</code>, anything) is answered with the app's
					<code>index.html</code> (GA4/GTM tags injected server-side - see
					<code>LPCM_GA4_ID</code> / <code>LPCM_GTM_ID</code> in wp-config.php), and
					React Router renders the right page client-side.</li>
				<li>Re-uploading a new build replaces the old one immediately - no need to
					re-toggle takeover.</li>
			</ul>
			<p style="font-size:12px;color:#888;">Need WordPress to keep serving something else at a
				given path? Add it via the <code>lpcm_reserved_prefixes</code> filter.</p>

			<h2>Product tools</h2>
			<p class="description">COA/tab-content CSV import and one-time product-seeding tools have
				moved to their own page: <a href="<?php echo esc_url( admin_url( 'admin.php?page=longevity-product-tools' ) ); ?>">Longevity Peptides Product Tools</a>.</p>
		</div>
		<?php
	}

	public static function handle_upload() {
		if ( ! current_user_can( 'manage_options' ) || ! check_admin_referer( 'lpcm_upload_dist' ) ) {
			wp_die( 'Not allowed.' );
		}

		if ( empty( $_FILES['dist_zip']['tmp_name'] ) || $_FILES['dist_zip']['error'] !== UPLOAD_ERR_OK ) {
			self::redirect_with_error( 'No file uploaded, or the upload failed.' );
		}

		$file     = $_FILES['dist_zip'];
		$filetype = wp_check_filetype( $file['name'], [ 'zip' => 'application/zip' ] );
		if ( $filetype['ext'] !== 'zip' ) {
			self::redirect_with_error( 'Please upload a .zip file.' );
		}

		if ( ! class_exists( 'ZipArchive' ) ) {
			self::redirect_with_error( "The PHP zip extension isn't available on this server, so uploaded builds can't be extracted." );
		}

		// Deliberately plain PHP here rather than WP_Filesystem()/unzip_file()
		// - this plugin only ever writes inside its own dist/ folder, which
		// it's guaranteed to own by virtue of being an active plugin, so
		// there's no scenario where FTP-style credentials are genuinely
		// needed. WP_Filesystem() can fall back to requesting FTP
		// credentials on some hosts even when direct writes would work
		// fine, which silently no-ops this exact upload with no visible
		// error - using plain PHP sidesteps that entirely.
		self::clear_directory( LPCM_DIST_DIR );
		if ( ! file_exists( LPCM_DIST_DIR ) ) {
			wp_mkdir_p( LPCM_DIST_DIR );
		}

		$zip    = new ZipArchive();
		$opened = $zip->open( $file['tmp_name'] );
		if ( $opened !== true ) {
			self::redirect_with_error( 'Could not open the uploaded zip (error code ' . $opened . ').' );
		}
		$extracted = $zip->extractTo( LPCM_DIST_DIR );
		$zip->close();
		if ( ! $extracted ) {
			self::redirect_with_error( "Could not extract the zip to the plugin's dist/ folder - check file permissions." );
		}

		// Some zip tools wrap contents in a top-level folder - if index.html
		// isn't at dist/index.html, look one level down and flatten it up.
		if ( ! file_exists( LPCM_DIST_DIR . 'index.html' ) ) {
			$entries = glob( LPCM_DIST_DIR . '*', GLOB_ONLYDIR );
			if ( count( $entries ) === 1 && file_exists( $entries[0] . '/index.html' ) ) {
				self::flatten_directory( $entries[0], LPCM_DIST_DIR );
			}
		}

		if ( ! file_exists( LPCM_DIST_DIR . 'index.html' ) ) {
			self::redirect_with_error( "Extracted the zip, but no index.html was found. Make sure you zipped the contents of dist/, not the folder itself." );
		}

		update_option( 'lpcm_dist_uploaded_at', current_time( 'timestamp' ) );

		wp_safe_redirect( add_query_arg( [ 'page' => 'longevity-content-manager', 'uploaded' => '1' ], admin_url( 'admin.php' ) ) );
		exit;
	}

	/** Recursively deletes everything inside a directory, in plain PHP. */
	private static function clear_directory( $dir ) {
		if ( ! is_dir( $dir ) ) {
			return;
		}
		$items = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $dir, RecursiveDirectoryIterator::SKIP_DOTS ),
			RecursiveIteratorIterator::CHILD_FIRST
		);
		foreach ( $items as $item ) {
			if ( $item->isDir() ) {
				rmdir( $item->getRealPath() );
			} else {
				unlink( $item->getRealPath() );
			}
		}
	}

	private static function flatten_directory( $from, $to ) {
		foreach ( glob( $from . '/*' ) as $item ) {
			$dest = $to . basename( $item );
			if ( is_dir( $item ) ) {
				self::copy_directory( $item, $dest );
			} else {
				copy( $item, $dest );
			}
		}
		self::clear_directory( $from );
		rmdir( $from );
	}

	private static function copy_directory( $from, $to ) {
		if ( ! is_dir( $to ) ) {
			mkdir( $to, 0755, true );
		}
		foreach ( glob( $from . '/*' ) as $item ) {
			$dest = $to . '/' . basename( $item );
			if ( is_dir( $item ) ) {
				self::copy_directory( $item, $dest );
			} else {
				copy( $item, $dest );
			}
		}
	}

	private static function redirect_with_error( $message ) {
		wp_safe_redirect( add_query_arg(
			[ 'page' => 'longevity-content-manager', 'upload_error' => urlencode( $message ) ],
			admin_url( 'admin.php' )
		) );
		exit;
	}

	public static function handle_toggle() {
		if ( ! current_user_can( 'manage_options' ) || ! check_admin_referer( 'lpcm_toggle_takeover' ) ) {
			wp_die( 'Not allowed.' );
		}
		$next = isset( $_POST['next_state'] ) && $_POST['next_state'] === '1';
		update_option( 'lpcm_takeover_active', $next );
		wp_safe_redirect( admin_url( 'admin.php?page=longevity-content-manager' ) );
		exit;
	}

	public static function show_notices() {
		$screen = get_current_screen();
		if ( ! $screen || strpos( $screen->id, 'longevity-content-manager' ) === false ) {
			return;
		}
		if ( get_option( 'lpcm_takeover_active' ) && ! self::has_build() ) {
			echo '<div class="notice notice-error"><p><strong>Longevity Content Manager:</strong> SPA takeover
				is on, but no build is installed - the router is silently standing down and
				WordPress\'s normal theme is serving the front-end instead. Upload a build below.</p></div>';
		}
	}
}
