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
 *     not the REST API or the browser-driven admin importer.
 *   - Runs in small AJAX steps (a handful of products per request) instead
 *     of one long request, so it never runs into a reverse-proxy timeout
 *     (nginx's default proxy_read_timeout, or PHP-FPM's
 *     request_terminate_timeout) — those sit in front of PHP and will kill
 *     a slow request regardless of anything set_time_limit() does inside
 *     PHP itself. The browser just calls one small step, then the next,
 *     showing progress, until done.
 *   - Tolerates a failed image download per-row instead of aborting the
 *     whole batch — the product still gets created, just without a photo,
 *     and the failure is reported so it can be fixed and re-run (imports
 *     are idempotent: matched by slug, safe to run more than once).
 *   - Maps every product into this site's own category taxonomy (Fat Loss
 *     & Metabolic, Recovery & Repair, Longevity, Cognitive, Peptides,
 *     Peptide Blends, Research Supplies — the same categories the
 *     storefront's shop page filters by) instead of trusting the export's
 *     own inconsistent category tags.
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

	/** Products created (with image downloads) per AJAX step - keeps each request short enough to never hit a reverse-proxy timeout. */
	const MAIN_BATCH_SIZE = 3;
	/** Variation groups attached per step - no image downloads here, so a larger batch is still fast. */
	const VARIATION_BATCH_SIZE = 5;

	public static function init() {
		add_action( 'admin_menu', [ __CLASS__, 'add_menu' ] );
		add_action( 'wp_ajax_lpcm_import_start', [ __CLASS__, 'ajax_start' ] );
		add_action( 'wp_ajax_lpcm_import_step', [ __CLASS__, 'ajax_step' ] );
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
		?>
		<div class="wrap">
			<h1>Import Products (CSV)</h1>
			<div style="background:#fff;border:1px solid #e0e0e0;padding:24px;max-width:820px;margin:20px 0 0;border-radius:4px;">
				<p style="font-size:13px;color:#555;margin:0 0 16px;">
					Upload a standard WooCommerce product-export CSV (the same
					column format <strong>Products → Export</strong> produces:
					<code>ID, Type, SKU, ..., Categories, ..., Images, ..., Parent, ..., Attribute 1 name, ...</code>).
					Runs in small steps in the background - never one long
					request, so it can't be cut off by a reverse-proxy timeout
					no matter how large the file or how slow the image
					downloads are. Safe to re-run: existing products are
					matched by slug and updated in place, not duplicated.
					Categories are mapped automatically to this site's own
					taxonomy (Fat Loss &amp; Metabolic, Recovery &amp; Repair,
					Longevity, Cognitive, Peptides, Peptide Blends, Research
					Supplies), and any product named
					"<code>&lt;Compound&gt; Kit</code>" is tagged as a 10-vial
					pack automatically - no separate step needed.
				</p>

				<div id="lpcm-import-progress" style="display:none;margin-bottom:16px;">
					<div style="background:#f3f4f6;border-radius:4px;height:10px;overflow:hidden;margin-bottom:8px;">
						<div id="lpcm-import-bar" style="background:#2563eb;height:100%;width:0%;transition:width .3s;"></div>
					</div>
					<p id="lpcm-import-status" style="font-size:12px;color:#555;margin:0;">Starting…</p>
				</div>

				<div id="lpcm-import-log" style="display:none;background:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:4px;margin-bottom:16px;max-height:420px;overflow-y:auto;"></div>

				<form id="lpcm-import-form" enctype="multipart/form-data">
					<?php wp_nonce_field( 'lpcm_run_import', 'lpcm_import_nonce' ); ?>
					<input type="file" name="lpcm_csv_file" id="lpcm-import-file" accept=".csv" required style="margin-bottom:16px;display:block;">
					<button type="submit" id="lpcm-import-submit" class="button button-primary" style="font-size:14px;height:38px;padding:0 20px;">
						📦 Run Import
					</button>
				</form>
			</div>
		</div>
		<script>
		(function () {
			var form = document.getElementById('lpcm-import-form');
			var submitBtn = document.getElementById('lpcm-import-submit');
			var progressWrap = document.getElementById('lpcm-import-progress');
			var bar = document.getElementById('lpcm-import-bar');
			var status = document.getElementById('lpcm-import-status');
			var log = document.getElementById('lpcm-import-log');
			var ajaxUrl = '<?php echo esc_js( admin_url( 'admin-ajax.php' ) ); ?>';
			var nonce = document.getElementById('lpcm_import_nonce').value;

			function appendResults(results) {
				log.style.display = 'block';
				(results || []).forEach(function (r) {
					var line = document.createElement('div');
					line.style.fontFamily = 'monospace';
					line.style.fontSize = '12px';
					line.style.color = r.ok ? '#15803d' : '#b45309';
					line.style.marginBottom = '3px';
					line.textContent = (r.ok ? '✅ ' : '⚠️ ') + r.msg;
					log.appendChild(line);
				});
				log.scrollTop = log.scrollHeight;
			}

			// Step count is tracked client-side (stepsDone / totalSteps), not
			// by the server — each AJAX call is a single sequential step this
			// loop itself is driving, so it always knows exactly how many
			// it's made without the server needing to persist a counter.
			var stepsDone = 0;
			var totalSteps = 1;

			function step(jobId) {
				var body = new FormData();
				body.append('action', 'lpcm_import_step');
				body.append('nonce', nonce);
				body.append('job_id', jobId);

				fetch(ajaxUrl, { method: 'POST', credentials: 'same-origin', body: body })
					.then(function (r) { return r.json(); })
					.then(function (json) {
						if (!json.success) {
							status.textContent = 'Error: ' + (json.data && json.data.message ? json.data.message : 'unknown error');
							submitBtn.disabled = false;
							return;
						}
						var data = json.data;
						appendResults(data.results);
						stepsDone = Math.min(stepsDone + 1, totalSteps);
						var pct = Math.round((stepsDone / totalSteps) * 100);
						bar.style.width = pct + '%';
						status.textContent = data.done
							? 'Done — ' + stepsDone + ' of ' + totalSteps + ' steps complete.'
							: 'Importing… ' + stepsDone + ' of ' + totalSteps + ' steps complete.';

						if (data.done) {
							bar.style.width = '100%';
							submitBtn.disabled = false;
						} else {
							step(jobId);
						}
					})
					.catch(function (err) {
						status.textContent = 'Request failed: ' + err.message + ' — retrying…';
						setTimeout(function () { step(jobId); }, 2000);
					});
			}

			form.addEventListener('submit', function (e) {
				e.preventDefault();
				submitBtn.disabled = true;
				log.innerHTML = '';
				log.style.display = 'none';
				progressWrap.style.display = 'block';
				bar.style.width = '0%';
				status.textContent = 'Uploading and reading file…';
				stepsDone = 0;
				totalSteps = 1;

				var body = new FormData();
				body.append('action', 'lpcm_import_start');
				body.append('nonce', nonce);
				body.append('lpcm_csv_file', document.getElementById('lpcm-import-file').files[0]);

				fetch(ajaxUrl, { method: 'POST', credentials: 'same-origin', body: body })
					.then(function (r) { return r.json(); })
					.then(function (json) {
						if (!json.success) {
							status.textContent = 'Error: ' + (json.data && json.data.message ? json.data.message : 'unknown error');
							submitBtn.disabled = false;
							return;
						}
						totalSteps = json.data.total;
						status.textContent = 'Parsed ' + totalSteps + ' step(s). Importing…';
						step(json.data.job_id);
					})
					.catch(function (err) {
						status.textContent = 'Upload failed: ' + err.message;
						submitBtn.disabled = false;
					});
			});
		})();
		</script>
		<?php
	}

	// ---------------------------------------------------------------
	// AJAX: start - parse the CSV (fast, no images) and queue the work
	// ---------------------------------------------------------------

	public static function ajax_start() {
		check_ajax_referer( 'lpcm_run_import', 'nonce' );
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( [ 'message' => 'Insufficient permissions.' ], 403 );
		}
		if ( ! class_exists( 'WC_Product_Simple' ) ) {
			wp_send_json_error( [ 'message' => 'WooCommerce is not active.' ] );
		}
		if ( empty( $_FILES['lpcm_csv_file']['tmp_name'] ) || ! is_uploaded_file( $_FILES['lpcm_csv_file']['tmp_name'] ) ) {
			wp_send_json_error( [ 'message' => 'No file uploaded, or the upload failed.' ] );
		}

		$handle = fopen( $_FILES['lpcm_csv_file']['tmp_name'], 'r' );
		if ( ! $handle ) {
			wp_send_json_error( [ 'message' => 'Could not open the uploaded file.' ] );
		}

		$header = fgetcsv( $handle );
		if ( ! $header ) {
			fclose( $handle );
			wp_send_json_error( [ 'message' => 'Empty or unreadable CSV.' ] );
		}
		$col = array_flip( array_map( 'trim', $header ) );

		$main_rows           = [];
		$variation_rows      = []; // original_parent_id (string) => [ row-as-assoc, ... ]

		while ( ( $row = fgetcsv( $handle ) ) !== false ) {
			if ( count( $row ) < 2 ) {
				continue; // blank trailing line
			}
			$assoc = self::row_to_assoc( $row, $col );

			if ( $assoc['Type'] === 'variation' ) {
				$parent_id = '';
				if ( preg_match( '/^id:(\d+)$/', $assoc['Parent'] ?? '', $m ) ) {
					$parent_id = $m[1];
				}
				$variation_rows[ $parent_id ][] = $assoc;
			} else {
				$main_rows[] = $assoc;
			}
		}
		fclose( $handle );

		$job_id = wp_generate_uuid4();
		$job    = [
			'main_rows'      => $main_rows,
			'variation_rows' => $variation_rows,
			'id_map'         => [], // original CSV "ID" -> real WooCommerce product ID, filled in as main_rows are processed
		];
		set_transient( self::job_key( $job_id ), $job, HOUR_IN_SECONDS );

		$total_steps = (int) ceil( count( $main_rows ) / self::MAIN_BATCH_SIZE )
			+ (int) ceil( count( $variation_rows ) / self::VARIATION_BATCH_SIZE );

		wp_send_json_success( [ 'job_id' => $job_id, 'total' => max( $total_steps, 1 ) ] );
	}

	private static function row_to_assoc( array $row, array $col ): array {
		$assoc = [];
		foreach ( $col as $name => $index ) {
			$assoc[ $name ] = isset( $row[ $index ] ) ? trim( (string) $row[ $index ] ) : '';
		}
		return $assoc;
	}

	private static function job_key( string $job_id ): string {
		return 'lpcm_import_job_' . $job_id;
	}

	// ---------------------------------------------------------------
	// AJAX: step - process one small batch, save progress, return results
	// ---------------------------------------------------------------

	public static function ajax_step() {
		check_ajax_referer( 'lpcm_run_import', 'nonce' );
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( [ 'message' => 'Insufficient permissions.' ], 403 );
		}

		$job_id = isset( $_POST['job_id'] ) ? sanitize_text_field( wp_unslash( $_POST['job_id'] ) ) : '';
		$job    = get_transient( self::job_key( $job_id ) );
		if ( ! is_array( $job ) ) {
			wp_send_json_error( [ 'message' => 'Import job expired or not found. Please re-upload the file.' ] );
		}

		$results = [];

		if ( ! empty( $job['main_rows'] ) ) {
			$batch = array_splice( $job['main_rows'], 0, self::MAIN_BATCH_SIZE );
			foreach ( $batch as $row ) {
				$results[] = self::import_main_row( $row, $job['id_map'] );
			}
		} elseif ( ! empty( $job['variation_rows'] ) ) {
			$keys  = array_slice( array_keys( $job['variation_rows'] ), 0, self::VARIATION_BATCH_SIZE );
			foreach ( $keys as $key ) {
				$rows = $job['variation_rows'][ $key ];
				unset( $job['variation_rows'][ $key ] );
				$results[] = self::attach_variations( $key, $rows, $job['id_map'] );
			}
		}

		$done = empty( $job['main_rows'] ) && empty( $job['variation_rows'] );

		if ( $done ) {
			delete_transient( self::job_key( $job_id ) );
		} else {
			set_transient( self::job_key( $job_id ), $job, HOUR_IN_SECONDS );
		}

		wp_send_json_success( [
			'results' => array_filter( $results ),
			'done'    => $done,
		] );
	}

	/** Creates/updates one parent (variable or simple) product from a CSV row. Returns a { ok, msg } result row. */
	private static function import_main_row( array $assoc, array &$id_map ): array {
		$type = $assoc['Type'];
		$name = $assoc['Name'];

		try {
			[ $base_name, $pack_size ] = self::split_kit_name( $name );
			$category = self::category_for( $base_name );

			$slug        = sanitize_title( $name );
			$existing_id = self::find_product_id_by_slug( $slug );
			$product     = $existing_id
				? wc_get_product( $existing_id )
				: ( $type === 'variable' ? new WC_Product_Variable() : new WC_Product_Simple() );

			$product->set_name( $name );
			$product->set_slug( $slug );
			$product->set_status( 'publish' );
			$product->set_catalog_visibility( 'visible' );
			$product->set_description( wp_kses_post( $assoc['Description'] ?? '' ) );
			$product->set_short_description( wp_kses_post( $assoc['Short description'] ?? '' ) );
			$product->set_reviews_allowed( true );

			if ( $type === 'simple' ) {
				$price = $assoc['Regular price'] ?? '';
				if ( $price !== '' ) {
					$product->set_regular_price( $price );
				}
				$product->set_manage_stock( false );
				$product->set_stock_status( 'instock' );
			}

			self::assign_category( $product, $category );

			$product_id = $product->save();
			update_post_meta( $product_id, '_lpcm_pack_size', $pack_size );

			$original_id = $assoc['ID'] ?? '';
			if ( $original_id !== '' ) {
				$id_map[ $original_id ] = $product_id;
			}

			$image_url = $assoc['Images'] ?? '';
			if ( $image_url ) {
				$outcome = self::sideload_and_set_thumbnail( $product_id, $image_url );
				if ( is_wp_error( $outcome ) ) {
					return [ 'ok' => false, 'msg' => "{$name} — created (ID {$product_id}), but image failed: {$outcome->get_error_message()}" ];
				}
				return [ 'ok' => true, 'msg' => "{$name} — {$type}, category \"{$category}\", pack size {$pack_size}, image set." ];
			}
			return [ 'ok' => true, 'msg' => "{$name} — {$type}, category \"{$category}\", pack size {$pack_size}, no image in file." ];
		} catch ( Exception $e ) {
			return [ 'ok' => false, 'msg' => "{$name} — failed: {$e->getMessage()}" ];
		}
	}

	/** Attaches every collected dose-variation row to its real parent product ID. Returns a { ok, msg } result row. */
	private static function attach_variations( string $original_parent_id, array $rows, array $id_map ): array {
		$parent_id = $id_map[ $original_parent_id ] ?? 0;
		if ( ! $parent_id ) {
			return [ 'ok' => false, 'msg' => "Variation rows referencing original ID {$original_parent_id} — parent product not found, skipped." ];
		}

		$parent = wc_get_product( $parent_id );
		if ( ! $parent || ! $parent->is_type( 'variable' ) ) {
			return [ 'ok' => false, 'msg' => "Original ID {$original_parent_id} — parent is not a variable product, skipped." ];
		}

		$doses = [];
		foreach ( $rows as $row ) {
			$doses[] = $row['Attribute 1 value(s)'] ?? '';
		}
		$doses = array_values( array_unique( array_filter( $doses ) ) );

		// A local (product-specific) attribute, not a global taxonomy-backed
		// one, matching this export's "Attribute 1 global" = 0.
		$attribute = new WC_Product_Attribute();
		$attribute->set_id( 0 );
		$attribute->set_name( 'Dose' );
		$attribute->set_options( $doses );
		$attribute->set_visible( true );
		$attribute->set_variation( true );
		$parent->set_attributes( [ $attribute ] );
		$parent->save();

		foreach ( $rows as $row ) {
			$dose  = $row['Attribute 1 value(s)'] ?? '';
			$price = $row['Regular price'] ?? '';

			$variation_id = self::find_variation_id( $parent_id, $dose );
			$variation    = $variation_id ? new WC_Product_Variation( $variation_id ) : new WC_Product_Variation();
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

		return [ 'ok' => true, 'msg' => $parent->get_name() . ' — ' . count( $rows ) . ' dose variation(s) attached.' ];
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
