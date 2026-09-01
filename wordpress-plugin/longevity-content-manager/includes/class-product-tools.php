<?php
/**
 * Bulk product creation, Product Tabs (COA + additional-info) CSV-derived
 * import, and a generic Product Image tool for setting/replacing a
 * product's featured image by slug. Split out of the router file itself
 * so the deploy/serving mechanism (uploader + spa-router) stays focused -
 * these are WooCommerce data-entry helpers, not part of "serve the
 * frontend."
 *
 * Product Tabs data and the default image map are both empty out of the
 * box - populate them by hooking the `lpcm_product_tab_data` and
 * `lpcm_default_product_images` filters (e.g. from a small site-specific
 * mu-plugin), or just paste values directly into the two textareas below
 * each time. bulk_create_products() covers creating any WooCommerce
 * products those references point at that don't exist yet.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class LPCM_Product_Tools {

	public static function init() {
		add_action( 'admin_menu', [ __CLASS__, 'add_menu' ] );
		add_filter( 'woocommerce_rest_prepare_product_object', [ __CLASS__, 'expose_meta' ], 10, 2 );
	}

	public static function add_menu() {
		add_submenu_page(
			'longevity-content-manager',
			'Longevity Peptides Product Tools',
			'Product Tools',
			'manage_options',
			'longevity-product-tools',
			[ __CLASS__, 'render' ]
		);
	}

	/**
	 * Expose COA/additional-info postmeta (under the _lpcm_* keys this
	 * plugin reads and writes) in the WooCommerce REST API response, so the
	 * headless frontend can read them.
	 */
	public static function expose_meta( $response, $object ) {
		$id            = $object->get_id();
		$coa           = get_post_meta( $id, '_lpcm_coa_images', true );
		$info          = get_post_meta( $id, '_lpcm_additional_info', true );
		$purity_pdf    = get_post_meta( $id, '_lpcm_coa_purity_pdf', true );
		$endotoxin_pdf = get_post_meta( $id, '_lpcm_coa_endotoxin_pdf', true );

		$data = $response->get_data();
		$meta = $data['meta_data'] ?? [];

		if ( $coa ) {
			$meta[] = [ 'key' => '_lpcm_coa_images', 'value' => $coa ];
		}
		if ( $info ) {
			$meta[] = [ 'key' => '_lpcm_additional_info', 'value' => $info ];
		}
		if ( $purity_pdf ) {
			$meta[] = [ 'key' => '_lpcm_coa_purity_pdf', 'value' => $purity_pdf ];
		}
		if ( $endotoxin_pdf ) {
			$meta[] = [ 'key' => '_lpcm_coa_endotoxin_pdf', 'value' => $endotoxin_pdf ];
		}

		$data['meta_data'] = $meta;
		$response->set_data( $data );
		return $response;
	}

	public static function render() {
		$import_results = null;
		if ( isset( $_POST['lpcm_import_tabs'] ) && check_admin_referer( 'lpcm_import_tabs' ) ) {
			$import_results = self::run_tab_import();
		}

		$image_sync_results = null;
		if ( isset( $_POST['lpcm_sync_images'] ) && check_admin_referer( 'lpcm_sync_images' ) ) {
			$image_sync_results = self::sync_product_images( wp_unslash( $_POST['lpcm_image_map'] ?? '' ) );
		}

		$bulk_create_results = null;
		if ( isset( $_POST['lpcm_bulk_create'] ) && check_admin_referer( 'lpcm_bulk_create' ) ) {
			$bulk_create_results = self::bulk_create_products( wp_unslash( $_POST['lpcm_bulk_create_list'] ?? '' ) );
		}

		$default_map          = self::format_image_map( self::get_default_image_map() );
		$default_create_list  = self::format_bulk_create_list( self::get_default_bulk_create_list() );
		?>
		<div class="wrap">
			<h1>Longevity Peptides Product Tools</h1>

			<div style="background:#fff;border:1px solid #e0e0e0;padding:24px;max-width:720px;margin:20px 0 0;border-radius:4px;">
				<h2 style="margin-top:0;">🧬 Bulk Create Missing Products</h2>
				<p style="font-size:13px;color:#555;margin:0 0 16px;">
					One line per product: <code>slug|Name|price</code> (price optional, defaults to 0 -
					set it in WooCommerce afterward if left blank). Creates each as a <strong>draft</strong>
					simple product - review and publish manually once pricing/description are set. A line
					whose slug already matches an existing product (any status) is skipped, so this is safe
					to re-run. When a line's slug matches an entry in the Product Image Upload list above,
					that photo is set automatically on creation. Prefilled with every product referenced by
					the `lpcm_product_tab_data` filter that doesn't have a real product yet - edit
					slugs/names/prices or remove lines before running. After creating a product here, update
					its placeholder ID in whatever supplies that filter, then run the Product Tabs Import
					below to attach its COA/description data.
				</p>

				<?php self::render_results( $bulk_create_results ); ?>

				<form method="post">
					<?php wp_nonce_field( 'lpcm_bulk_create' ); ?>
					<input type="hidden" name="lpcm_bulk_create" value="1">
					<textarea name="lpcm_bulk_create_list" rows="16" style="width:100%;font-family:monospace;font-size:12px;margin-bottom:12px;"><?php echo esc_textarea( $default_create_list ); ?></textarea>
					<button type="submit" class="button button-primary" style="font-size:14px;height:38px;padding:0 20px;">
						🧬 Create Missing Products
					</button>
				</form>
			</div>

			<div style="background:#fff;border:1px solid #e0e0e0;padding:24px;max-width:720px;margin:20px 0 0;border-radius:4px;">
				<h2 style="margin-top:0;">🖼️ Product Image Upload</h2>
				<p style="font-size:13px;color:#555;margin:0 0 16px;">
					One line per product: <code>slug|image-url</code>. Sideloads each image and sets it as
					that product's featured image, <strong>replacing</strong> whatever is set now. Unknown
					slugs are skipped and reported below. Prefilled with the current Longevity Peptides product
					photography - edit or add lines as needed before running.
				</p>

				<?php self::render_results( $image_sync_results ); ?>

				<form method="post">
					<?php wp_nonce_field( 'lpcm_sync_images' ); ?>
					<input type="hidden" name="lpcm_sync_images" value="1">
					<textarea name="lpcm_image_map" rows="16" style="width:100%;font-family:monospace;font-size:12px;margin-bottom:12px;"><?php echo esc_textarea( $default_map ); ?></textarea>
					<button type="submit" class="button button-primary" style="font-size:14px;height:38px;padding:0 20px;">
						🖼️ Upload &amp; Set Product Images
					</button>
				</form>
			</div>

			<div style="background:#fff;border:1px solid #e0e0e0;padding:24px;max-width:720px;margin:20px 0 0;border-radius:4px;">
				<h2 style="margin-top:0;">Product Tabs — CSV Import</h2>
				<p style="font-size:13px;color:#555;margin:0 0 16px;">
					Writes COA images and Additional Information into WooCommerce product meta for all products.
					Run this once after first install, or again any time the CSV data changes.
				</p>

				<?php self::render_results( $import_results ); ?>

				<form method="post">
					<?php wp_nonce_field( 'lpcm_import_tabs' ); ?>
					<input type="hidden" name="lpcm_import_tabs" value="1">
					<button type="submit" class="button button-primary" style="font-size:14px;height:38px;padding:0 20px;">
						▶ Run Product Tabs Import
					</button>
				</form>
			</div>
		</div>
		<?php
	}

	private static function render_results( ?array $results ) {
		if ( $results === null ) {
			return;
		}
		?>
		<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:4px;margin-bottom:16px;">
			<p style="font-weight:700;color:#166534;margin:0 0 10px;">Done!</p>
			<?php foreach ( $results as $r ) :
				$color = $r['ok'] ? '#15803d' : '#b45309'; ?>
				<div style="font-family:monospace;font-size:12px;color:<?php echo esc_attr( $color ); ?>;margin-bottom:3px;">
					<?php echo $r['ok'] ? '✅' : '⚠️'; ?> <?php echo esc_html( $r['msg'] ); ?>
				</div>
			<?php endforeach; ?>
		</div>
		<?php
	}

	/**
	 * The current Longevity Peptides product photography, keyed by product
	 * slug - the "-removebg" (transparent background) variant is preferred
	 * where the media library has one, since that's what the shop grid and
	 * product gallery composite over the site's own background.
	 */
	public static function get_default_image_map(): array {
		return apply_filters( 'lpcm_default_product_images', [] );
	}

	private static function format_image_map( array $map ): string {
		$lines = [];
		foreach ( $map as $slug => $url ) {
			$lines[] = "{$slug}|{$url}";
		}
		return implode( "\n", $lines );
	}

	/**
	 * Parses the "slug|url" textarea and, for every line naming a real
	 * product, sideloads the image and sets it as the featured image -
	 * replacing any image already set. Unlike the old one-off bulk
	 * creators' sideload step, this is a deliberate replace, not a
	 * skip-if-already-attached.
	 */
	public static function sync_product_images( string $raw ): array {
		if ( ! function_exists( 'wc_get_product_id_by_sku' ) ) {
			return [ [ 'ok' => false, 'msg' => 'WooCommerce is not active. Cannot set product images.' ] ];
		}

		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$results = [];

		foreach ( preg_split( '/\r\n|\r|\n/', trim( $raw ) ) as $line ) {
			$line = trim( $line );
			if ( $line === '' || strpos( $line, '|' ) === false ) {
				continue;
			}
			[ $slug, $image_url ] = array_map( 'trim', explode( '|', $line, 2 ) );
			if ( ! $slug || ! $image_url ) {
				continue;
			}

			$product_id = self::find_product_id_by_slug( $slug );
			if ( ! $product_id ) {
				$results[] = [ 'ok' => false, 'msg' => "{$slug} — no matching product found, skipped." ];
				continue;
			}

			$outcome = self::sideload_and_set_thumbnail( $product_id, $image_url );
			if ( is_wp_error( $outcome ) ) {
				$results[] = [ 'ok' => false, 'msg' => "{$slug} — {$outcome->get_error_message()}" ];
				continue;
			}

			$results[] = [ 'ok' => true, 'msg' => "{$slug} (ID {$product_id}) — image set from " . basename( $image_url ) ];
		}

		return $results;
	}

	/**
	 * Downloads $image_url, sideloads it into the media library attached to
	 * $product_id, and sets it as that product's featured image (replacing
	 * and deleting whatever was set before). Shared by sync_product_images()
	 * and bulk_create_products() so both paths behave identically.
	 */
	private static function sideload_and_set_thumbnail( int $product_id, string $image_url ) {
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$tmp = download_url( $image_url );
		if ( is_wp_error( $tmp ) ) {
			return new WP_Error( 'download_failed', 'could not download ' . $image_url . ': ' . $tmp->get_error_message() );
		}

		$file_array = [
			'name'     => sanitize_file_name( basename( $image_url ) ),
			'tmp_name' => $tmp,
		];

		$product_name  = get_the_title( $product_id );
		$attachment_id = media_handle_sideload( $file_array, $product_id, $product_name );
		@unlink( $tmp );

		if ( is_wp_error( $attachment_id ) ) {
			return new WP_Error( 'sideload_failed', 'sideload failed: ' . $attachment_id->get_error_message() );
		}

		$old_thumb_id = get_post_thumbnail_id( $product_id );
		set_post_thumbnail( $product_id, $attachment_id );
		update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $product_name ) );

		if ( $old_thumb_id && $old_thumb_id !== $attachment_id ) {
			wp_delete_attachment( $old_thumb_id, true );
		}

		return true;
	}

	private static function find_product_id_by_slug( string $slug ): int {
		$product_id = wc_get_product_id_by_sku( $slug );
		if ( $product_id ) {
			return $product_id;
		}

		$posts = get_posts( [
			'name'        => $slug,
			'post_type'   => 'product',
			'post_status' => [ 'publish', 'draft', 'pending', 'private' ],
			'numberposts' => 1,
			'fields'      => 'ids',
		] );

		return $posts[0] ?? 0;
	}

	/**
	 * All products from product_tabs_full_content.csv. Key = WooCommerce
	 * product ID (small integers 0-14 are placeholders for not-yet-created
	 * products).
	 */
	public static function get_tab_data(): array {
		return apply_filters( 'lpcm_product_tab_data', [] );
	}

	/**
	 * Run the import - writes COA images and additional info into WP post
	 * meta for each product, under the _lpcm_* keys expose_meta() above
	 * reads back out over the REST API.
	 */
	public static function run_tab_import(): array {
		$results = [];
		foreach ( self::get_tab_data() as $product_id => $data ) {
			if ( $product_id < 100 ) {
				$results[] = [ 'ok' => false, 'msg' => "Skipped placeholder ID {$product_id} ({$data['name']}) — create the product first, then update its ID here." ];
				continue;
			}
			$post = get_post( $product_id );
			if ( ! $post || $post->post_type !== 'product' ) {
				$results[] = [ 'ok' => false, 'msg' => "ID {$product_id} ({$data['name']}) — not found, skipped." ];
				continue;
			}
			update_post_meta( $product_id, '_lpcm_coa_images', wp_json_encode( $data['coa'] ) );
			update_post_meta( $product_id, '_lpcm_additional_info', $data['info'] );
			$n         = count( $data['coa'] );
			$results[] = [ 'ok' => true, 'msg' => "ID {$product_id} ({$data['name']}) — {$n} COA image(s) + additional info saved." ];
		}
		return $results;
	}

	// ---------------------------------------------------------------
	// Bulk product creation - the generic replacement for the old one-off
	// "bulk create these two new products" buttons. Rebuilt because the
	// plugin otherwise has NO path to create a WooCommerce product at all -
	// class-product-tools.php only ever writes onto products that already
	// exist (tab data / images), which is exactly what let placeholder
	// product-tab-data entries (ID < 100) silently never turn into real,
	// orderable products - e.g. GLP-3 (RT) 30MG 404ing live because its
	// "create the product" step was assumed done but never ran.
	// ---------------------------------------------------------------

	/**
	 * Slug corrections for names where naive slugify() doesn't match this
	 * site's actual slug convention (blend/abbreviation names, mostly).
	 * Sourced from the real slugs already used elsewhere on the site
	 * (lpcm_default_product_images, COA library, VARIANT_GROUPS in the
	 * React app) - not guesses.
	 */
	private const SLUG_OVERRIDES = [
		0  => 'thymosin-alpha-1-10mg',
		1  => 'hexarelin-10mg',
		2  => 'oxytocin-5mg',
		3  => 'kisspeptin-10-10mg',
		4  => 'aod-9604-5mg',
		5  => 'melanotan-2-10mg',
		6  => 'epitalon-50mg',
		7  => 'cagrilintide-10mg',
		8  => 'dsip-5mg',
		12 => 'cjc-ipa-20mg',
		13 => 'glp-2-tz-10mg',
		14 => 'kpv-10mg',
	];

	/** Lowercase, hyphenated slug from a "COMPOUND – DOSE" style name - the fallback when no SLUG_OVERRIDES entry exists. */
	private static function slugify( string $name ): string {
		$s = str_replace( [ '–', '—' ], '-', $name ); // normalize en/em dash to hyphen
		$s = str_replace( [ '(', ')', '+' ], '', $s );
		$s = strtolower( trim( $s ) );
		$s = preg_replace( '/[^a-z0-9]+/', '-', $s );
		return trim( $s, '-' );
	}

	/**
	 * Every placeholder entry (product_id < 100, meaning "not a real
	 * WooCommerce product yet") from the Product Tabs data - these are the
	 * products this site's own data references but that may never have
	 * actually been created. Slug is SLUG_OVERRIDES when available, else
	 * slugify(name) - review before running, this isn't guaranteed correct
	 * for every line.
	 */
	public static function get_default_bulk_create_list(): array {
		$list = [];
		foreach ( self::get_tab_data() as $product_id => $data ) {
			if ( $product_id >= 100 ) {
				continue; // already has a real WC product ID, not this tool's job
			}
			$slug   = self::SLUG_OVERRIDES[ $product_id ] ?? self::slugify( $data['name'] );
			$list[] = [ 'slug' => $slug, 'name' => $data['name'], 'price' => '' ];
		}
		return $list;
	}

	private static function format_bulk_create_list( array $list ): string {
		$lines = [];
		foreach ( $list as $row ) {
			$lines[] = "{$row['slug']}|{$row['name']}|{$row['price']}";
		}
		return implode( "\n", $lines );
	}

	/**
	 * Parses the "slug|Name|price" textarea and creates one draft
	 * WC_Product_Simple per line whose slug doesn't already match an
	 * existing product (any status) - re-running this is always safe,
	 * existing products are left untouched. When the slug also has an
	 * entry in lpcm_default_product_images, that photo is sideloaded
	 * and set as the new product's featured image immediately.
	 */
	public static function bulk_create_products( string $raw ): array {
		if ( ! class_exists( 'WC_Product_Simple' ) ) {
			return [ [ 'ok' => false, 'msg' => 'WooCommerce is not active. Cannot create products.' ] ];
		}

		$image_map = self::get_default_image_map();
		$results   = [];

		foreach ( preg_split( '/\r\n|\r|\n/', trim( $raw ) ) as $line ) {
			$line = trim( $line );
			if ( $line === '' || strpos( $line, '|' ) === false ) {
				continue;
			}
			$parts = array_map( 'trim', explode( '|', $line, 3 ) );
			[ $slug, $name ] = [ $parts[0] ?? '', $parts[1] ?? '' ];
			$price = $parts[2] ?? '';
			if ( ! $slug || ! $name ) {
				continue;
			}

			if ( self::find_product_id_by_slug( $slug ) ) {
				$results[] = [ 'ok' => false, 'msg' => "{$slug} — a product with this slug already exists, skipped." ];
				continue;
			}

			$product = new WC_Product_Simple();
			$product->set_name( sanitize_text_field( $name ) );
			$product->set_slug( sanitize_title( $slug ) );
			$product->set_status( 'draft' ); // review pricing/description before publishing
			$product->set_catalog_visibility( 'visible' );
			if ( $price !== '' && is_numeric( $price ) ) {
				$product->set_regular_price( $price );
			}
			$product_id = $product->save();

			if ( ! $product_id ) {
				$results[] = [ 'ok' => false, 'msg' => "{$slug} — failed to create product." ];
				continue;
			}

			$msg = "{$slug} (new ID {$product_id}) — created as draft" . ( $price !== '' ? " at \${$price}" : ' (no price set)' ) . '.';

			if ( isset( $image_map[ $slug ] ) ) {
				$outcome = self::sideload_and_set_thumbnail( $product_id, $image_map[ $slug ] );
				$msg    .= is_wp_error( $outcome ) ? ' Image sideload failed: ' . $outcome->get_error_message() . '.' : ' Photo set.';
			}

			$results[] = [ 'ok' => true, 'msg' => $msg ];
		}

		return $results;
	}
}
