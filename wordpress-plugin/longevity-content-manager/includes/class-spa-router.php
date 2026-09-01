<?php
/**
 * The actual "router". Three jobs, in order:
 *
 *  1. 301-redirect the old `/product/:slug` URL shape (pre-headless WordPress)
 *     to the React app's `/products/:slug` route, preserving any query string.
 *  2. If the requested path matches a real file inside the uploaded dist/
 *     folder (JS bundles, CSS, fonts, images, favicon - anything Vite
 *     built), serve that file directly with the correct Content-Type and
 *     long-lived caching. This is the standard, battle-tested way to host
 *     a Vite/CRA-style SPA (equivalent to nginx's `try_files $uri
 *     $uri/ /index.html;` or `serve -s`) - it means a plain `npm run
 *     build` output works with zero special configuration, since every
 *     asset reference (HTML attributes, CSS @font-face url()s, and
 *     JS-bundled string literals like an <img src="/assets/...">) all
 *     resolve to real files at the site root exactly as built, instead of
 *     needing every reference rewritten after the fact.
 *  3. Otherwise, serve index.html (with GA4/GTM/verification tags injected
 *     into <head>) and let React Router handle the path client-side - this
 *     is the actual SPA fallback, and only applies to real *routes*
 *     (/shop, /products/:slug, etc.), never to static files.
 *
 * Only active once an admin has both uploaded a build AND explicitly
 * flipped on "SPA takeover" (see class-uploader.php) - never auto-enables
 * itself. Same skeleton as the Aera Frontend Loader plugin's
 * class-spa-router.php, adapted for this site's own redirect + head-inject
 * behavior.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class LPCM_SPA_Router {

	/** Path prefixes WordPress must keep handling normally. */
	private static $reserved_prefixes = [
		'/wp-admin',
		'/wp-json',
		'/wp-login.php',
		'/wp-register.php',
		'/wp-cron.php',
		'/xmlrpc.php',
		'/wp-content',
		'/wp-includes',
		'/feed',
		'/sitemap.xml',
		'/sitemap_index.xml',
		'/robots.txt',
	];

	private static $mime_types = [
		'html'        => 'text/html; charset=UTF-8',
		'js'          => 'application/javascript; charset=UTF-8',
		'mjs'         => 'application/javascript; charset=UTF-8',
		'css'         => 'text/css; charset=UTF-8',
		'json'        => 'application/json; charset=UTF-8',
		'svg'         => 'image/svg+xml',
		'png'         => 'image/png',
		'jpg'         => 'image/jpeg',
		'jpeg'        => 'image/jpeg',
		'gif'         => 'image/gif',
		'webp'        => 'image/webp',
		'ico'         => 'image/x-icon',
		'woff'        => 'font/woff',
		'woff2'       => 'font/woff2',
		'ttf'         => 'font/ttf',
		'eot'         => 'application/vnd.ms-fontobject',
		'txt'         => 'text/plain; charset=UTF-8',
		'map'         => 'application/json; charset=UTF-8',
		'webmanifest' => 'application/manifest+json',
	];

	public static function init() {
		// Priority 0, ahead of most other template_redirect callbacks, so
		// the app is served before WordPress does any further template
		// resolution work for a request it's not actually going to render.
		add_action( 'template_redirect', [ __CLASS__, 'maybe_serve_spa' ], 0 );
	}

	public static function maybe_serve_spa() {
		if ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return;
		}

		$path = self::current_path();

		// ── Legacy URL redirect: /product/:slug → /products/:slug ──────────────
		// Preserved from the pre-SPA-takeover WordPress permalink shape.
		if ( preg_match( '#^/product/([^/?]+)#', $path, $m ) ) {
			$qs = isset( $_SERVER['QUERY_STRING'] ) && $_SERVER['QUERY_STRING'] !== ''
				? '?' . $_SERVER['QUERY_STRING'] : '';
			wp_safe_redirect( '/products/' . rawurlencode( $m[1] ) . $qs, 301 );
			exit;
		}

		if ( ! get_option( 'lpcm_takeover_active' ) ) {
			return;
		}

		$index_path = LPCM_DIST_DIR . 'index.html';
		if ( ! file_exists( $index_path ) ) {
			return;
		}

		if ( self::is_reserved( $path ) ) {
			return;
		}

		// WooCommerce AJAX - always a query param, never a path prefix.
		if ( isset( $_GET['wc-ajax'] ) ) {
			return;
		}

		// Job 2: a real built file (JS/CSS/fonts/images/favicon/etc.) - serve
		// it directly, whatever the extension, so nothing needs rewriting
		// after the build.
		$file_path = self::resolve_static_file( $path );
		if ( $file_path ) {
			self::serve_file( $file_path );
		}

		// Job 3: not a real file - treat it as a client-side route and let
		// React Router take over.
		self::serve_index( $index_path );
	}

	private static function current_path() {
		$uri  = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/';
		$path = wp_parse_url( $uri, PHP_URL_PATH );
		return $path ? $path : '/';
	}

	private static function is_reserved( $path ) {
		$prefixes = apply_filters( 'lpcm_reserved_prefixes', self::$reserved_prefixes );
		foreach ( $prefixes as $prefix ) {
			if ( strpos( $path, $prefix ) === 0 ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Maps a request path directly onto the dist/ folder and returns the
	 * real filesystem path if (and only if) a file genuinely exists there -
	 * never guesses, never falls back to index.html itself (that's the
	 * caller's job). Guards against path traversal since this reads
	 * directly from a URL.
	 */
	private static function resolve_static_file( $path ) {
		$relative = ltrim( rawurldecode( $path ), '/' );
		if ( $relative === '' || $relative === 'index.html' ) {
			return null; // handled as the SPA shell, not a static passthrough
		}

		$candidate = realpath( LPCM_DIST_DIR . $relative );
		$dist_real = realpath( LPCM_DIST_DIR );

		if (
			$candidate === false ||
			$dist_real === false ||
			strpos( $candidate, $dist_real ) !== 0 || // path traversal guard
			! is_file( $candidate )
		) {
			return null;
		}

		return $candidate;
	}

	private static function serve_file( $file_path ) {
		$ext  = strtolower( pathinfo( $file_path, PATHINFO_EXTENSION ) );
		$mime = self::$mime_types[ $ext ] ?? 'application/octet-stream';

		status_header( 200 );
		header( 'Content-Type: ' . $mime );
		header( 'Content-Length: ' . filesize( $file_path ) );
		// Vite fingerprints filenames (index-<hash>.js), so a built asset
		// never changes contents without also changing its URL - safe to
		// cache aggressively. index.html itself is served separately,
		// below, without this header.
		header( 'Cache-Control: public, max-age=31536000, immutable' );
		readfile( $file_path ); // phpcs:ignore -- static local file resolved and traversal-checked above
		exit;
	}

	private static function serve_index( $index_path ) {
		$html = file_get_contents( $index_path );

		$inject = self::get_head_inject();
		if ( $inject ) {
			$html = str_replace( '</head>', $inject . "\n</head>", $html );
		}

		status_header( 200 );
		nocache_headers();
		header( 'Content-Type: text/html; charset=UTF-8' );
		echo $html; // phpcs:ignore -- static local file with a plain string substitution, not user input
		exit;
	}

	/**
	 * Returns HTML to inject just before </head> on every page - analytics,
	 * search-console verification, etc. Add/remove tags here as needed, no
	 * touching the built index.html or rebuilding to change an ID.
	 */
	private static function get_head_inject() {
		$tags = [];

		$verification = defined( 'LPCM_SITE_VERIFICATION' ) ? LPCM_SITE_VERIFICATION : '';
		if ( $verification ) {
			$tags[] = '<meta name="google-site-verification" content="' . esc_attr( $verification ) . '" />';
		}

		// Google Analytics 4 - set in wp-config.php: define('LPCM_GA4_ID','G-XXXXXXXXXX');
		$ga4_id = defined( 'LPCM_GA4_ID' ) ? LPCM_GA4_ID : '';
		if ( $ga4_id ) {
			$ga4_id = esc_attr( $ga4_id );
			$tags[] = <<<HTML
<script async src="https://www.googletagmanager.com/gtag/js?id={$ga4_id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '{$ga4_id}');
</script>
HTML;
		}

		// Google Tag Manager - alternative to GA4 direct. Set in
		// wp-config.php: define('LPCM_GTM_ID','GTM-XXXXXXX');
		$gtm_id = defined( 'LPCM_GTM_ID' ) ? LPCM_GTM_ID : '';
		if ( $gtm_id ) {
			$gtm_id = esc_attr( $gtm_id );
			$tags[] = <<<HTML
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','{$gtm_id}');</script>
HTML;
		}

		return implode( "\n", $tags );
	}
}
