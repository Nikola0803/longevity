<?php
defined( 'ABSPATH' ) || exit;

/**
 * REST endpoints consumed by the Next.js storefront's COA/verify pages:
 *   GET /wp-json/longevity/v1/coas               - full library, optional ?product=<slug>
 *   GET /wp-json/longevity/v1/coa-latest          - newest COA for ?product=<slug> (product-level QR target)
 *   GET /wp-json/longevity/v1/coa-lookup          - exact + partial match on ?lot=<lot> (batch verification)
 *
 * Same namespace (longevity/v1) as longevity-content-manager's auth endpoints - both
 * plugins share it deliberately, matching what the frontend already expects
 * without needing per-plugin API prefixes.
 */
class LPCOA_REST_API {

	const NS = 'longevity/v1';

	public static function init() {
		add_action( 'rest_api_init', [ __CLASS__, 'register_routes' ] );
		add_filter( 'rest_post_type_collections_private', [ __CLASS__, 'allow_private_cpt_in_rest' ], 10, 2 );
	}

	// Allow this private CPT to be read via REST (auth handled per-route, all public/read-only here).
	public static function allow_private_cpt_in_rest( $private, $post_type ) {
		return $post_type === 'lpcoa_coa' ? false : $private;
	}

	public static function register_routes() {
		register_rest_route( self::NS, '/coas', [
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => [ __CLASS__, 'get_coas' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'product' => [ 'type' => 'string', 'default' => '' ],
			],
		] );

		register_rest_route( self::NS, '/coa-latest', [
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => [ __CLASS__, 'get_latest_coa_by_product' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'product' => [ 'type' => 'string', 'required' => true ],
			],
		] );

		register_rest_route( self::NS, '/coa-lookup', [
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => [ __CLASS__, 'lookup_coa_by_lot' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'lot' => [ 'type' => 'string', 'required' => true ],
			],
		] );
	}

	public static function get_coas( WP_REST_Request $req ): WP_REST_Response {
		$args = [
			'post_type'      => 'lpcoa_coa',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'date',
			'order'          => 'DESC',
		];

		$product_slug = sanitize_text_field( $req->get_param( 'product' ) );
		if ( $product_slug ) {
			$args['meta_query'] = [ [
				'key'     => '_lpcoa_product_slug',
				'value'   => $product_slug,
				'compare' => '=',
			] ];
		}

		$posts = get_posts( $args );
		$data  = array_map( [ __CLASS__, 'format_coa' ], $posts );

		return new WP_REST_Response( $data, 200 );
	}

	public static function get_latest_coa_by_product( WP_REST_Request $req ): WP_REST_Response {
		$product_slug = trim( sanitize_text_field( $req->get_param( 'product' ) ) );
		if ( $product_slug === '' ) {
			return new WP_REST_Response( [ 'found' => null ], 200 );
		}

		$posts = get_posts( [
			'post_type'      => 'lpcoa_coa',
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'orderby'        => 'date',
			'order'          => 'DESC',
			'meta_query'     => [ [
				'key'     => '_lpcoa_product_slug',
				'value'   => $product_slug,
				'compare' => '=',
			] ],
		] );

		$found = $posts ? self::format_coa( $posts[0] ) : null;

		return new WP_REST_Response( [ 'found' => $found ], 200 );
	}

	public static function lookup_coa_by_lot( WP_REST_Request $req ): WP_REST_Response {
		$lot = trim( sanitize_text_field( $req->get_param( 'lot' ) ) );
		if ( $lot === '' ) {
			return new WP_REST_Response( [ 'exact' => null, 'matches' => [] ], 200 );
		}

		$posts = get_posts( [
			'post_type'      => 'lpcoa_coa',
			'post_status'    => 'publish',
			'posts_per_page' => 25,
			'meta_query'     => [ [
				'key'     => '_lpcoa_lot',
				'value'   => $lot,
				'compare' => 'LIKE',
			] ],
		] );

		$matches = array_map( [ __CLASS__, 'format_coa' ], $posts );

		$exact = null;
		foreach ( $matches as $m ) {
			if ( strcasecmp( $m['lot'], $lot ) === 0 ) {
				$exact = $m;
				break;
			}
		}

		return new WP_REST_Response( [ 'exact' => $exact, 'matches' => $matches ], 200 );
	}

	// Shape matches the frontend's COAEntry type exactly, so coaData.ts can
	// consume this response with no field translation.
	private static function format_coa( WP_Post $p ): array {
		$lot          = get_post_meta( $p->ID, '_lpcoa_lot', true );
		$product_slug = get_post_meta( $p->ID, '_lpcoa_product_slug', true );
		return [
			'id'           => $p->ID,
			'name'         => $p->post_title,
			'dose'         => get_post_meta( $p->ID, '_lpcoa_dose', true ),
			'category'     => 'Research',
			'coaUrl'       => get_post_meta( $p->ID, '_lpcoa_pdf_url', true ) ?: null,
			'endotoxinUrl' => get_post_meta( $p->ID, '_lpcoa_endotoxin_url', true ) ?: null,
			'productSlug'  => $product_slug,
			'labName'      => get_post_meta( $p->ID, '_lpcoa_lab', true ) ?: 'N/A',
			'testDate'     => get_post_meta( $p->ID, '_lpcoa_date', true ),
			'lot'          => $lot,
			'purity'       => get_post_meta( $p->ID, '_lpcoa_purity', true ),
			'qrUrl'        => $lot ? self::qr_image_url( '/coa/' . rawurlencode( $lot ) ) : null,
			// Permanent, product-level QR: printed once on a product's label
			// and never regenerated. Always resolves (via /coa-latest) to
			// whichever COA is newest for this product, instead of a
			// one-off code tied to a single batch.
			'productQrUrl' => $product_slug ? self::qr_image_url( '/coa/product/' . rawurlencode( $product_slug ) ) : null,
		];
	}

	private static function qr_image_url( string $path ): string {
		$frontend_url = get_option( 'lpcoa_frontend_url' ) ?: home_url();
		$verify_url   = untrailingslashit( $frontend_url ) . $path;
		return 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . rawurlencode( $verify_url );
	}
}
