<?php
defined( 'ABSPATH' ) || exit;

/** Registers the lpcoa_coa custom post type - one post per lab-tested batch. */
class LPCOA_Post_Type {

	public static function init() {
		add_action( 'init', [ __CLASS__, 'register' ] );
	}

	public static function register() {
		register_post_type( 'lpcoa_coa', [
			'labels'       => [
				'name'          => 'COA Files',
				'singular_name' => 'COA',
				'add_new_item'  => 'Upload New COA',
			],
			'public'       => false,
			'show_ui'      => true,
			'show_in_menu' => false, // added under this plugin's own top-level menu, see class-lpcoa-admin.php
			'show_in_rest' => true,
			'rest_base'    => 'lpcoa-coas',
			'supports'     => [ 'title', 'page-attributes' ],
		] );

		foreach ( [
			'_lpcoa_product_slug',
			'_lpcoa_lot',
			'_lpcoa_date',
			'_lpcoa_pdf_url',
			'_lpcoa_endotoxin_url',
			'_lpcoa_purity',
			'_lpcoa_dose',
			'_lpcoa_lab',
		] as $meta ) {
			register_post_meta( 'lpcoa_coa', $meta, [
				'type'         => 'string',
				'single'       => true,
				'show_in_rest' => true,
				'default'      => '',
			] );
		}
	}
}
