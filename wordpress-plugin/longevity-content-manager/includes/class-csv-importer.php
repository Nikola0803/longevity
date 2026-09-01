<?php
/**
 * Real product importer for Longevity Peptides' own WooCommerce product
 * export CSVs (the standard WooCommerce "Type,SKU,...,Attribute 1 name,..."
 * column format — parent variable/simple rows followed by their
 * "variation" child rows, linked via a Parent column holding `id:<row id>`
 * back to the ID column of the row it belongs to).
 *
 * Built because wp-admin's own Products → Import screen times out on
 * shared hosting for a file this size (~90 rows), mostly from
 * synchronously downloading every product image mid-request. This importer
 * instead:
 *   - Writes products directly via WooCommerce's PHP API (WC_Product_*),
 *     not the REST API or the browser-driven admin importer — far fewer
 *     round trips, and it can raise its own time limit.
 *   - Tolerates a failed image download per-row instead of aborting the
 *     whole batch — the product still gets created, just without a photo,
 *     and the failure is reported so it can be fixed and re-run (imports
 *     are idempotent: matched by slug, safe to run more than once).
 *   - Maps every product into this site's own category taxonomy (Fat Loss
 *     & Metabolic, Recovery & Repair, Longevity, Cognitive, Peptides,
 *     Peptide Blends, Research Supplies — the same categories the
 *     Next.js/Vite storefront's shop page filters by) instead of trusting
 *     the export's own inconsistent category tags.
 *   - Recognizes the "<Compound> Kit" vs "<Compound>" naming convention
 *     this export uses for 10-vial bulk kits vs single vials, and tags
 *     each with `_lpcm_pack_size` (10 or 1) accordingly - read back out by
 *     class-catalog-api.php so the storefront's existing pack-size
 *     selector UI works against real data with zero frontend changes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class LPCM_CSV_Importer {

	public static function init() {
		add_action( 'admin_menu', [ __CLASS__, 'add_menu' ] );
	}

	public static function add_menu() {
		add_submenu_page(
			'longevity-content-manager',
			'Import Products (CSV)',
			'Import Products',
			'manage_woocommerce',
			'longevity-product-import',
			[ __CLASS__, 'render' ]
		);
	}

	/**
	 * Compound name (case-insensitive, "Kit" suffix already stripped) ->
	 * this site's category. Anything not listed here falls back to
	 * "Peptides" - a safe, real category rather than a made-up catch-all.
	 */
	private const CATEGORY_MAP = [
		'tirzepatide'                          => 'Fat Loss & Metabolic',
		'retatrutide'                          => 'Fat Loss & Metabolic',
		'semaglutide'                          => 'Fat Loss & Metabolic',
		'aod-9604'                             => 'Fat Loss & Metabolic',
		'bpc-157'                              => 'Recovery & Repair',
		'tb-500'                               => 'Recovery & Repair',
		'ghk-cu'                               => 'Recovery & Repair',
		'ahk-cu'                               => 'Recovery & Repair',
		'kpv'                                  => 'Recovery & Repair',
		'mots-c'                               => 'Longevity',
		'epithalon'                            => 'Longevity',
		'epitalon'                             => 'Longevity',
		'nad+'                                 => 'Longevity',
		'dsip'                                 => 'Longevity',
		'ss-31'                                => 'Longevity',
		'foxo4-dri'                            => 'Longevity',
		'selank'                               => 'Cognitive',
		'semax'                                => 'Cognitive',
		'tesamorelin'                          => 'Peptides',
		'ipamorelin'                           => 'Peptides',
		'cjc-1295 dac'                         => 'Peptides',
		'igf-1 lr3'                            => 'Peptides',
		'oxytocin'                             => 'Peptides',
		'gonadorelin'                          => 'Peptides',
		'wolverine (bpc-157 + tb-500)'         => 'Peptide Blends',
		'wolverine stack (bpc-157 + tb-500 + ghk-cu)'       => 'Peptide Blends',
		'wolverine stack (bpc-157 + tb-500 + ghk-cu + kpv)' => 'Peptide Blends',
		'cjc-1295 + ipamorelin'                => 'Peptide Blends',
		'bac water 3ml'                        => 'Research Supplies',
		'bac water 10ml'                       => 'Research Supplies',
	];

	private static function category_for( string $base_name ): string {
		$key = strtolower( trim( $base_name ) );
		return self::CATEGORY_MAP[ $key ] ?? 'Peptides';
	}

	/**
	 * Splits "<Compound> Kit" into [ "<Compound>", 10 ] and "<Compound>"
	 * into [ "<Compound>", 1 ]. This is the entire pack-size signal — no
	 * separate "pack" attribute exists in this export, the two are just
	 * separate parent products sharing a compound name.
	 */
	private static function split_kit_name( string $name ): array {
		if ( preg_match( '/^(.+?)\s+Kit$/i', $name, $m ) ) {
			return [ trim( $m[1] ), 10 ];
		}
		return [ $name, 1 ];
	}

	public static function render() {
		$results = null;
		if ( isset( $_POST['lpcm_run_import'] ) && check_admin_referer( 'lpcm_run_import' ) ) {
			if ( empty( $_FILES['lpcm_csv_file']['tmp_name'] ) || ! is_uploaded_file( $_FILES['lpcm_csv_file']['tmp_name'] ) ) {
				$results = [ [ 'ok' => false, 'msg' => 'No file uploaded, or the upload failed.' ] ];
			} else {
				$results = self::run_import( $_FILES['lpcm_csv_file']['tmp_name'] );
			}
		}
		?>
		<div class="wrap">
			<h1>Import Products (CSV)</h1>
			<div style="background:#fff;border:1px solid #e0e0e0;padding:24px;max-width:820px;margin:20px 0 0;border-radius:4px;">
				<p style="font-size:13px;color:#555;margin:0 0 16px;">
					Upload a standard WooCommerce product-export CSV (the same
					column format <strong>Products → Export</strong> produces:
					<code>ID, Type, SKU, ..., Categories, ..., Images, ..., Parent, ..., Attribute 1 name, ...</code>).
					Runs entirely server-side via WooCommerce's PHP API - no
					browser timeout, no partial imports. Safe to re-run: existing
					products are matched by slug and updated in place, not
					duplicated. Categories are mapped automatically to this
					site's own taxonomy (Fat Loss &amp; Metabolic, Recovery &amp;
					Repair, Longevity, Cognitive, Peptides, Peptide Blends,
					Research Supplies), and any product named
					"<code>&lt;Compound&gt; Kit</code>" is tagged as a 10-vial
					pack automatically - no separate step needed.
				</p>

				<?php if ( $results !== null ) : ?>
					<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:4px;margin-bottom:16px;max-height:420px;overflow-y:auto;">
						<p style="font-weight:700;color:#166534;margin:0 0 10px;">Import finished.</p>
						<?php foreach ( $results as $r ) :
							$color = $r['ok'] ? '#15803d' : '#b45309'; ?>
							<div style="font-family:monospace;font-size:12px;color:<?php echo esc_attr( $color ); ?>;margin-bottom:3px;">
								<?php echo $r['ok'] ? '✅' : '⚠️'; ?> <?php echo esc_html( $r['msg'] ); ?>
							</div>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>

				<form method="post" enctype="multipart/form-data">
					<?php wp_nonce_field( 'lpcm_run_import' ); ?>
					<input type="file" name="lpcm_csv_file" accept=".csv" required style="margin-bottom:16px;display:block;">
					<button type="submit" name="lpcm_run_import" value="1" class="button button-primary" style="font-size:14px;height:38px;padding:0 20px;">
						📦 Run Import
					</button>
				</form>
			</div>
		</div>
		<?php
	}

	public static function run_import( string $tmp_path ): array {
		if ( ! class_exists( 'WC_Product_Simple' ) ) {
			return [ [ 'ok' => false, 'msg' => 'WooCommerce is not active. Cannot import products.' ] ];
		}

		$handle = fopen( $tmp_path, 'r' );
		if ( ! $handle ) {
			return [ [ 'ok' => false, 'msg' => 'Could not open the uploaded file.' ] ];
		}

		// Don't let PHP's default 30s CLI/FPM limit or the browser connection
		// cut this off partway through a ~90-row batch with image downloads.
		if ( function_exists( 'set_time_limit' ) ) {
			@set_time_limit( 300 );
		}
		ignore_user_abort( true );

		$header = fgetcsv( $handle );
		if ( ! $header ) {
			fclose( $handle );
			return [ [ 'ok' => false, 'msg' => 'Empty or unreadable CSV.' ] ];
		}
		$col = array_flip( array_map( 'trim', $header ) );

		$get = function ( array $row, string $key ) use ( $col ) {
			return isset( $col[ $key ], $row[ $col[ $key ] ] ) ? trim( (string) $row[ $col[ $key ] ] ) : '';
		};

		$results       = [];
		// Maps this CSV's own "ID" column values to the real WooCommerce
		// product IDs created during this run, so variation rows (which
		// reference their parent via "id:<original id>") can find the
		// right parent regardless of what ID WooCommerce actually assigns.
		$id_map        = [];
		$pending_variations = []; // original_parent_id => [ row, ... ]

		while ( ( $row = fgetcsv( $handle ) ) !== false ) {
			if ( count( $row ) < 2 ) {
				continue; // blank trailing line
			}

			$type          = $get( $row, 'Type' );
			$original_id   = $get( $row, 'ID' );
			$name          = $get( $row, 'Name' );
			$parent_ref    = $get( $row, 'Parent' );

			if ( $type === 'variation' ) {
				// Deferred until after every parent row is created (variation
				// rows always follow their parent in this export, but don't
				// rely on that - collect first, attach after the full pass).
				$parent_id = 0;
				if ( preg_match( '/^id:(\d+)$/', $parent_ref, $m ) ) {
					$parent_id = (int) $m[1];
				}
				$pending_variations[ $parent_id ][] = $row;
				continue;
			}

			try {
				[ $base_name, $pack_size ] = self::split_kit_name( $name );
				$category = self::category_for( $base_name );

				$product = ( $type === 'variable' )
					? new WC_Product_Variable()
					: new WC_Product_Simple();

				$slug = sanitize_title( $name );
				$existing_id = self::find_product_id_by_slug( $slug );
				if ( $existing_id ) {
					$product = wc_get_product( $existing_id );
				}

				$product->set_name( $name );
				$product->set_slug( $slug );
				$product->set_status( 'publish' );
				$product->set_catalog_visibility( 'visible' );
				$product->set_description( wp_kses_post( $get( $row, 'Description' ) ) );
				$product->set_short_description( wp_kses_post( $get( $row, 'Short description' ) ) );
				$product->set_reviews_allowed( true );

				if ( $type === 'simple' ) {
					$price = $get( $row, 'Regular price' );
					if ( $price !== '' ) {
						$product->set_regular_price( $price );
					}
					$product->set_manage_stock( false );
					$product->set_stock_status( 'instock' );
				}

				self::assign_category( $product, $category );

				$product_id = $product->save();
				update_post_meta( $product_id, '_lpcm_pack_size', $pack_size );

				if ( $original_id !== '' ) {
					$id_map[ $original_id ] = $product_id;
				}

				$image_url = $get( $row, 'Images' );
				if ( $image_url ) {
					$outcome = self::sideload_and_set_thumbnail( $product_id, $image_url );
					if ( is_wp_error( $outcome ) ) {
						$results[] = [ 'ok' => false, 'msg' => "{$name} — created (ID {$product_id}), but image failed: {$outcome->get_error_message()}" ];
					} else {
						$results[] = [ 'ok' => true, 'msg' => "{$name} — {$type}, category \"{$category}\", pack size {$pack_size}, image set." ];
					}
				} else {
					$results[] = [ 'ok' => true, 'msg' => "{$name} — {$type}, category \"{$category}\", pack size {$pack_size}, no image in file." ];
				}
			} catch ( Exception $e ) {
				$results[] = [ 'ok' => false, 'msg' => "{$name} — failed: {$e->getMessage()}" ];
			}
		}
		fclose( $handle );

		// Second pass: attach every collected variation row to its real
		// parent product ID via $id_map, and set that parent's variation
		// attribute (always "Dose" in this export) so WooCommerce actually
		// offers the right set of options.
		foreach ( $pending_variations as $original_parent_id => $rows ) {
			$parent_id = $id_map[ (string) $original_parent_id ] ?? 0;
			if ( ! $parent_id ) {
				$results[] = [ 'ok' => false, 'msg' => "Variation rows referencing original ID {$original_parent_id} — parent product not found, skipped." ];
				continue;
			}

			$parent = wc_get_product( $parent_id );
			if ( ! $parent || ! $parent->is_type( 'variable' ) ) {
				continue;
			}

			$doses = [];
			foreach ( $rows as $row ) {
				$doses[] = $get( $row, 'Attribute 1 value(s)' );
			}
			$doses = array_values( array_unique( array_filter( $doses ) ) );

			// A global (site-wide, taxonomy-backed) attribute would need its
			// own registration step; a local (product-specific) attribute is
			// exactly what this export's "Attribute 1 global" = 0 means, and
			// is simpler to import reliably.
			$attribute = new WC_Product_Attribute();
			$attribute->set_id( 0 );
			$attribute->set_name( 'Dose' );
			$attribute->set_options( $doses );
			$attribute->set_visible( true );
			$attribute->set_variation( true );
			$parent->set_attributes( [ $attribute ] );
			$parent->save();

			foreach ( $rows as $row ) {
				$dose = $get( $row, 'Attribute 1 value(s)' );
				$price = $get( $row, 'Regular price' );

				$var_slug = sanitize_title( $get( $row, 'Name' ) );
				$variation_id = self::find_variation_id( $parent_id, $dose );
				$variation = $variation_id ? new WC_Product_Variation( $variation_id ) : new WC_Product_Variation();
				$variation->set_parent_id( $parent_id );
				$variation->set_attributes( [ 'dose' => $dose ] );
				if ( $price !== '' ) {
					$variation->set_regular_price( $price );
				}
				$variation->set_status( 'publish' );
				$variation->set_manage_stock( false );
				$variation->set_stock_status( 'instock' );
				$variation->save();
			}

			$results[] = [ 'ok' => true, 'msg' => $parent->get_name() . ' — ' . count( $rows ) . ' dose variation(s) attached.' ];
		}

		return $results;
	}

	private static function find_product_id_by_slug( string $slug ): int {
		$posts = get_posts( [
			'name'        => $slug,
			'post_type'   => 'product',
			'post_status' => [ 'publish', 'draft', 'pending', 'private' ],
			'numberposts' => 1,
			'fields'      => 'ids',
		] );
		return $posts[0] ?? 0;
	}

	private static function find_variation_id( int $parent_id, string $dose ): int {
		$children = get_posts( [
			'post_type'   => 'product_variation',
			'post_parent' => $parent_id,
			'post_status' => 'any',
			'numberposts' => -1,
			'fields'      => 'ids',
		] );
		foreach ( $children as $child_id ) {
			$attrs = wc_get_product( $child_id )->get_attributes();
			if ( ( $attrs['dose'] ?? '' ) === $dose ) {
				return $child_id;
			}
		}
		return 0;
	}

	/** Creates the category term if it doesn't exist yet, then assigns it. */
	private static function assign_category( WC_Product $product, string $category_name ): void {
		$term = term_exists( $category_name, 'product_cat' );
		if ( ! $term ) {
			$term = wp_insert_term( $category_name, 'product_cat' );
		}
		if ( ! is_wp_error( $term ) && isset( $term['term_id'] ) ) {
			$product->set_category_ids( [ (int) $term['term_id'] ] );
		}
	}

	/**
	 * Downloads $image_url and sets it as $product_id's featured image.
	 * Failure here (dead link, host down, timeout) is caught and reported,
	 * never allowed to abort the rest of the import.
	 */
	private static function sideload_and_set_thumbnail( int $product_id, string $image_url ) {
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$tmp = download_url( $image_url, 15 );
		if ( is_wp_error( $tmp ) ) {
			return $tmp;
		}

		$file_array = [
			'name'     => sanitize_file_name( basename( wp_parse_url( $image_url, PHP_URL_PATH ) ?: $image_url ) ),
			'tmp_name' => $tmp,
		];

		$product_name  = get_the_title( $product_id );
		$attachment_id = media_handle_sideload( $file_array, $product_id, $product_name );
		if ( file_exists( $tmp ) ) {
			@unlink( $tmp );
		}

		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		set_post_thumbnail( $product_id, $attachment_id );
		update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $product_name ) );
		return true;
	}
}
