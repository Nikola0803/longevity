<?php
/**
 * Public, read-only product catalog for the headless storefront -
 * GET /wp-json/longevity/v1/catalog - built directly from WooCommerce's own
 * PHP API (wc_get_products(), WC_Product_Variable::get_children(), etc.),
 * not the WooCommerce Store API.
 *
 * Why not Store API: Store API's product-list endpoint doesn't reliably
 * expose a variable product's per-variation price/stock/attribute
 * breakdown in one call across WooCommerce versions, which is exactly the
 * data the storefront's dose/pack-size selector UI needs. Reading straight
 * from WooCommerce's PHP objects here sidesteps that entirely - this
 * plugin controls both ends of the contract (this endpoint and the
 * frontend's `Product` type), so the shape below IS the contract, not a
 * guess at one.
 *
 * Pack size: every product is either a single vial (`_lpcm_pack_size`
 * meta = 1, the default when absent) or a 10-vial kit (= 10) - see
 * class-csv-importer.php, which sets this automatically for anything
 * imported as "<Compound> Kit". Two products sharing the same base name
 * (kit name with " Kit" stripped) and the same dose are exactly the pair
 * the frontend's pack-size selector groups together.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class LPCM_Catalog_API {

	const NS = 'longevity/v1';

	public static function init() {
		add_action( 'rest_api_init', [ __CLASS__, 'register_routes' ] );
	}

	public static function register_routes() {
		register_rest_route( self::NS, '/catalog', [
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => [ __CLASS__, 'get_catalog' ],
			'permission_callback' => '__return_true',
		] );
	}

	public static function get_catalog(): WP_REST_Response {
		if ( ! function_exists( 'wc_get_products' ) ) {
			return new WP_REST_Response( [], 200 );
		}

		$products = wc_get_products( [
			'status'  => 'publish',
			'limit'   => -1,
			'type'    => [ 'simple', 'variable' ],
		] );

		$out = [];
		foreach ( $products as $product ) {
			if ( $product->is_type( 'variable' ) ) {
				foreach ( self::adapt_variable( $product ) as $entry ) {
					$out[] = $entry;
				}
			} else {
				$out[] = self::adapt_simple( $product );
			}
		}

		return new WP_REST_Response( $out, 200 );
	}

	/** Splits "<Compound> Dose" into ["<Compound>", "Dose"] when the name ends in a recognizable unit; otherwise no split. */
	private static function split_trailing_dose( string $name ): array {
		if ( preg_match( '/^(.*?)\s+([\d.]+\s*(?:mg|mcg|g|ml))$/i', trim( $name ), $m ) ) {
			return [ trim( $m[1] ), $m[2] ];
		}
		return [ $name, '' ];
	}

	private static function pack_size( WC_Product $product ): int {
		$meta = get_post_meta( $product->get_id(), '_lpcm_pack_size', true );
		return $meta !== '' ? (int) $meta : 1;
	}

	/** Strips a trailing " Kit" from a product's own name - the pack-size signal this catalog's names carry. */
	private static function base_name( WC_Product $product ): string {
		$name = $product->get_name();
		return preg_replace( '/\s+Kit$/i', '', $name );
	}

	private static function category( WC_Product $product ): string {
		$terms = get_the_terms( $product->get_id(), 'product_cat' );
		if ( is_array( $terms ) && ! empty( $terms ) ) {
			return $terms[0]->name;
		}
		return 'Peptides';
	}

	private static function images( WC_Product $product ): array {
		$ids = array_filter( array_merge( [ $product->get_image_id() ], $product->get_gallery_image_ids() ) );
		$urls = [];
		foreach ( $ids as $id ) {
			$src = wp_get_attachment_image_url( $id, 'large' );
			if ( $src ) {
				$urls[] = $src;
			}
		}
		return $urls;
	}

	private static function status( WC_Product $product ): array {
		$in_stock = $product->is_in_stock();
		return [
			'statusLabel' => $in_stock ? 'In Stock' : 'Backordered',
			'disabled'    => ! $in_stock,
			'buttonText'  => $in_stock ? 'Add to Cart' : 'Unavailable',
		];
	}

	private static function adapt_simple( WC_Product $product ): array {
		$base_name          = self::base_name( $product );
		[ $display_name, $spec ] = self::split_trailing_dose( $base_name );
		$images             = self::images( $product );
		$status             = self::status( $product );

		return array_merge( [
			'slug'        => $product->get_slug(),
			'name'        => $display_name,
			'spec'        => $spec,
			'price'       => (float) $product->get_price(),
			'image'       => $images[0] ?? '/images/placeholder.png',
			'images'      => $images,
			'imgAlt'      => "{$display_name} research peptide vial",
			'imgTitle'    => $display_name,
			'category'    => self::category( $product ),
			'purity'      => '',
			'description' => wp_strip_all_tags( $product->get_description() ?: $product->get_short_description() ),
			'sku'         => $product->get_sku(),
			'wooProductId'=> $product->get_id(),
			'packSize'    => self::pack_size( $product ),
		], $status );
	}

	private static function adapt_variable( WC_Product_Variable $product ): array {
		$base_name  = self::base_name( $product );
		$images     = self::images( $product );
		$category   = self::category( $product );
		$pack_size  = self::pack_size( $product );
		$description = wp_strip_all_tags( $product->get_description() ?: $product->get_short_description() );

		$out = [];
		foreach ( $product->get_children() as $variation_id ) {
			$variation = wc_get_product( $variation_id );
			if ( ! $variation || ! $variation->exists() ) {
				continue;
			}
			$attrs = $variation->get_attributes();
			$spec  = $attrs['dose'] ?? implode( ' / ', array_values( $attrs ) );
			$slug_suffix = $spec ? '-' . sanitize_title( $spec ) : '';
			$pack_suffix = $pack_size > 1 ? "-{$pack_size}pack" : '';
			$in_stock = $variation->is_in_stock();

			$out[] = [
				'slug'         => $product->get_slug() . $slug_suffix . $pack_suffix,
				'name'         => $base_name,
				'spec'         => $spec,
				'price'        => (float) $variation->get_price(),
				'image'        => $images[0] ?? '/images/placeholder.png',
				'images'       => $images,
				'imgAlt'       => trim( "{$base_name} {$spec} research peptide vial" ),
				'imgTitle'     => trim( "{$base_name} · {$spec}" ),
				'category'     => $category,
				'purity'       => '',
				'description'  => $description,
				'sku'          => $variation->get_sku() ?: $product->get_sku(),
				'statusLabel'  => $in_stock ? 'In Stock' : 'Backordered',
				'disabled'     => ! $in_stock,
				'buttonText'   => $in_stock ? 'Add to Cart' : 'Unavailable',
				'wooProductId' => $product->get_id(),
				'wooVariationId' => $variation->get_id(),
				'packSize'     => $pack_size,
			];
		}
		return $out;
	}
}
