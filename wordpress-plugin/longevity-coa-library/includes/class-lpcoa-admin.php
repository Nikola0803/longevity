<?php
defined( 'ABSPATH' ) || exit;

class LPCOA_Admin {

	public static function init() {
		add_action( 'admin_menu', [ __CLASS__, 'register_menus' ] );

		// COA list table: Batch/Lot column + Product/Batch filters.
		add_filter( 'manage_lpcoa_coa_posts_columns', [ __CLASS__, 'coa_columns' ] );
		add_action( 'manage_lpcoa_coa_posts_custom_column', [ __CLASS__, 'render_coa_column' ], 10, 2 );
		add_filter( 'manage_edit-lpcoa_coa_sortable_columns', [ __CLASS__, 'coa_sortable_columns' ] );
		add_action( 'restrict_manage_posts', [ __CLASS__, 'coa_list_filters' ] );
		add_action( 'pre_get_posts', [ __CLASS__, 'apply_coa_list_filters' ] );
	}

	public static function register_menus() {
		add_menu_page(
			'Longevity Peptides COA Library',
			'COA Library',
			'edit_posts',
			'edit.php?post_type=lpcoa_coa',
			'',
			'dashicons-media-document',
			56
		);
		add_submenu_page( 'edit.php?post_type=lpcoa_coa', 'COA Library Settings', 'Settings', 'manage_options', 'lpcoa-settings', [ __CLASS__, 'render_settings' ] );
	}

	public static function render_settings() {
		if ( isset( $_POST['lpcoa_save_settings'] ) && check_admin_referer( 'lpcoa_save_settings' ) ) {
			update_option( 'lpcoa_frontend_url', esc_url_raw( trim( $_POST['lpcoa_frontend_url'] ?? '' ) ) );
			echo '<div class="notice notice-success is-dismissible"><p>Saved.</p></div>';
		}
		$frontend_url = get_option( 'lpcoa_frontend_url' ) ?: home_url();
		?>
		<div class="wrap">
			<h1>COA Library Settings</h1>
			<div style="background:#fff;border:1px solid #e0e0e0;padding:24px;max-width:640px;margin:20px 0 0;border-radius:4px;">
				<p style="font-size:13px;color:#555;margin:0 0 16px;">
					The public URL the React frontend is served from - used to build the QR codes
					printed on batch/product labels (<code>/coa/:lot</code> and
					<code>/coa/product/:slug</code>). Only matters if this WordPress install's own
					URL differs from the storefront's public URL.
				</p>
				<form method="post">
					<?php wp_nonce_field( 'lpcoa_save_settings' ); ?>
					<input type="url" name="lpcoa_frontend_url" value="<?php echo esc_attr( $frontend_url ); ?>" style="width:100%;max-width:420px;" placeholder="https://longevitytech-lab.com">
					<p><button type="submit" name="lpcoa_save_settings" value="1" class="button button-primary">Save</button></p>
				</form>
			</div>
		</div>
		<?php
	}

	// ── COA list table: columns ──────────────────────────────────────────────
	public static function coa_columns( array $columns ): array {
		$new = [];
		foreach ( $columns as $key => $label ) {
			$new[ $key ] = $label;
			if ( $key === 'title' ) {
				$new['lpcoa_product'] = 'Product';
				$new['lpcoa_lot']     = 'Batch / Lot #';
				$new['lpcoa_lab']     = 'Lab';
			}
		}
		return $new;
	}

	public static function render_coa_column( string $column, int $post_id ) {
		switch ( $column ) {
			case 'lpcoa_product':
				echo esc_html( get_post_meta( $post_id, '_lpcoa_product_slug', true ) ?: '—' );
				break;
			case 'lpcoa_lot':
				echo esc_html( get_post_meta( $post_id, '_lpcoa_lot', true ) ?: '—' );
				break;
			case 'lpcoa_lab':
				echo esc_html( get_post_meta( $post_id, '_lpcoa_lab', true ) ?: '—' );
				break;
		}
	}

	public static function coa_sortable_columns( array $columns ): array {
		$columns['lpcoa_lot']     = 'lpcoa_lot';
		$columns['lpcoa_product'] = 'lpcoa_product';
		return $columns;
	}

	// ── COA list table: filters (Product, Batch/Lot) ─────────────────────────
	public static function coa_list_filters( string $post_type ) {
		if ( $post_type !== 'lpcoa_coa' ) {
			return;
		}

		global $wpdb;
		$slugs = $wpdb->get_col(
			"SELECT DISTINCT pm.meta_value FROM {$wpdb->postmeta} pm
			 INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
			 WHERE pm.meta_key = '_lpcoa_product_slug' AND pm.meta_value != '' AND p.post_type = 'lpcoa_coa'
			 ORDER BY pm.meta_value ASC"
		);

		$current_product = isset( $_GET['lpcoa_product_filter'] ) ? sanitize_text_field( $_GET['lpcoa_product_filter'] ) : '';
		echo '<select name="lpcoa_product_filter">';
		echo '<option value="">All Products</option>';
		foreach ( $slugs as $slug ) {
			printf( '<option value="%1$s"%2$s>%1$s</option>', esc_attr( $slug ), selected( $current_product, $slug, false ) );
		}
		echo '</select>';

		$current_lot = isset( $_GET['lpcoa_lot_filter'] ) ? sanitize_text_field( $_GET['lpcoa_lot_filter'] ) : '';
		echo '<input type="text" name="lpcoa_lot_filter" placeholder="Search batch / lot #" value="' . esc_attr( $current_lot ) . '" style="margin-left:6px;">';
	}

	public static function apply_coa_list_filters( $query ) {
		if ( ! is_admin() || ! $query->is_main_query() ) {
			return;
		}
		if ( $query->get( 'post_type' ) !== 'lpcoa_coa' ) {
			return;
		}

		$meta_query = [];

		if ( ! empty( $_GET['lpcoa_product_filter'] ) ) {
			$meta_query[] = [
				'key'     => '_lpcoa_product_slug',
				'value'   => sanitize_text_field( $_GET['lpcoa_product_filter'] ),
				'compare' => '=',
			];
		}

		if ( ! empty( $_GET['lpcoa_lot_filter'] ) ) {
			$meta_query[] = [
				'key'     => '_lpcoa_lot',
				'value'   => sanitize_text_field( $_GET['lpcoa_lot_filter'] ),
				'compare' => 'LIKE',
			];
		}

		if ( $meta_query ) {
			$query->set( 'meta_query', $meta_query );
		}

		// Sorting by the custom columns above.
		$orderby = $query->get( 'orderby' );
		if ( $orderby === 'lpcoa_lot' ) {
			$query->set( 'meta_key', '_lpcoa_lot' );
			$query->set( 'orderby', 'meta_value' );
		} elseif ( $orderby === 'lpcoa_product' ) {
			$query->set( 'meta_key', '_lpcoa_product_slug' );
			$query->set( 'orderby', 'meta_value' );
		}
	}
}
