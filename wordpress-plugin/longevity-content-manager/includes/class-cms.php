<?php
/**
 * Site content (CMS) - editable copy for the marketing pages that today
 * live as hardcoded strings in the React source (hero headline, About page
 * prose, FAQ, testimonials, footer links, legal page bodies, etc). Gives
 * wp-admin a "Content (CMS)" screen to edit that copy, and exposes it over
 * REST at longevity/v1/cms so the React app can read it.
 *
 * Deliberately does NOT touch blog content - blog posts stay native
 * WordPress Posts (wp-admin -> Posts / wp/v2/posts), and do NOT touch
 * product/COA data - that already has its own admin path via WooCommerce
 * and class-product-tools.php. This is for the editorial copy that has no
 * other home.
 *
 * Storage: one autoload-off WP option per page bundle (lpcm_cms_home,
 * lpcm_cms_about, ...), each a plain associative array serialized by
 * WP core via update_option()/get_option(). See CMS_CONTENT_MODEL.md
 * (repo root of this plugin) for the full field-by-field contract.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class LPCM_CMS {

	/** Page keys this plugin manages, in the order they're shown in the admin UI. */
	const PAGES = [ 'home', 'about', 'contact', 'faq', 'shop', 'coa', 'legal', 'footer' ];

	public static function init() {
		add_action( 'rest_api_init', [ __CLASS__, 'register_routes' ], 10 );
		add_action( 'admin_menu', [ __CLASS__, 'add_menu' ] );
		add_action( 'admin_post_lpcm_save_cms', [ __CLASS__, 'handle_admin_post' ] );
	}

	/** WP option name for a given page key. */
	private static function option_name( string $page ): string {
		return 'lpcm_cms_' . $page;
	}

	// ---------------------------------------------------------------
	// Defaults (mirror the copy live in src/ at the time this shipped)
	// ---------------------------------------------------------------

	public static function get_defaults( string $page ): array {
		$all = self::get_all_defaults();
		return $all[ $page ] ?? [];
	}

	public static function get_all_defaults(): array {
		return [
			'home'    => self::default_home(),
			'about'   => self::default_about(),
			'contact' => self::default_contact(),
			'faq'     => self::default_faq(),
			'shop'    => self::default_shop(),
			'coa'     => self::default_coa(),
			'legal'   => self::default_legal(),
			'footer'  => self::default_footer(),
		];
	}

	private static function default_home(): array {
		return [
			'hero' => [
				'badge_text'        => '[ LONGEVITY PEPTIDES: THIRD-PARTY VERIFIED ]',
				'overline_text'     => 'Lyophilized Research Compounds for AU & NZ',
				'headline_line1'    => 'POTENCY.',
				'headline_line2'    => 'PURITY.',
				'headline_line3'    => 'PROOF.',
				'body_text'         => 'Every vial is lyophilized, tested, and documented before it reaches your bench. Longevity Peptides exists for one reason: give researchers compounds they can actually verify, batch by batch.',
				'disclaimer_text'   => '*Strictly for laboratory research use. Not for human or veterinary use.*',
				'cta_primary_label'   => 'Browse Compounds',
				'cta_primary_href'    => '/shop',
				'cta_secondary_label' => 'Our Standards',
				'cta_secondary_href'  => '/about',
				'stats' => [
					[ 'val' => '99%+',  'label' => 'Purity' ],
					[ 'val' => 'HPLC',  'label' => 'Tested' ],
					[ 'val' => 'AU/NZ', 'label' => 'Shipped' ],
					[ 'val' => 'COA',   'label' => 'Included' ],
				],
			],
			'quality' => [
				'eyebrow'   => 'Quality Assurance',
				'headline'  => 'Research-Grade From Start to Finish',
				'body'      => 'Longevity Peptides operates at the forefront of research-grade peptide acquisition. Every batch moves through a traceable, independently-verified pipeline before it ever reaches your bench.',
				'image_url' => '',
				'metrics' => [
					[ 'val' => '>99.9%',   'label' => 'Purity' ],
					[ 'val' => 'HPLC & MS', 'label' => 'Tested' ],
					[ 'val' => 'ISO 9001', 'label' => 'Facility' ],
				],
				'timeline' => [
					[ 'title' => 'Raw Material Synthesis', 'detail' => 'Purity benchmark >99% at the point of synthesis.' ],
					[ 'title' => 'Third-Party HPLC & Mass Spectrometry', 'detail' => 'Independent lab validation of identity and composition.' ],
					[ 'title' => 'Cold-Chain Vacuum Sealing', 'detail' => 'Vial integrity preserved from lab to lyophilization.' ],
					[ 'title' => 'Traceable Dispatch', 'detail' => 'Instant COA access via batch code on every shipment.' ],
				],
			],
			'bento' => [
				'headline' => "Research Categories, Curated",
				'tiles' => [
					[ 'name' => 'Fat Loss & Metabolic', 'summary' => 'Multi-receptor and GLP-1 axis peptides studied for appetite regulation and metabolic signaling, including Tirzepatide, Retatrutide, and Semaglutide.' ],
					[ 'name' => 'Recovery & Repair', 'summary' => 'Peptides examined for tissue signaling, microvascular activity, and structural recovery pathways, including BPC-157, TB-500, and KPV.' ],
					[ 'name' => 'Cognitive', 'summary' => 'Compounds studied in neuronal and cognitive-pathway models, including Selank and Semax.' ],
					[ 'name' => 'Longevity', 'summary' => 'Coenzymes and mitochondrial-signaling peptides studied for redox, cellular energy, and age-related markers, including NAD+ and MOTS-C.' ],
					[ 'name' => 'Peptide Blends', 'summary' => 'Multi-component research blends combining complementary peptides for combined-pathway research.' ],
					[ 'name' => 'Research Supplies', 'summary' => 'Reconstitution and handling supplies for laboratory research workflows, including bacteriostatic water.' ],
				],
			],
			'feature_cards' => [
				'eyebrow'  => 'Our Mission',
				'headline' => 'Commitment to Research Excellence',
				'body'     => 'Longevity Peptides is built on a foundation of scientific integrity, transparency, and reliability. Our mission is to support researchers with high-quality materials that contribute to meaningful scientific progress.',
				'cards' => [
					[ 'badge' => 'Lab Certified', 'title' => '99%+ Purity Verification', 'body' => 'Every batch independently analyzed by certified third-party laboratories to confirm purity, identity, and composition.', 'cta_label' => 'Learn More', 'cta_href' => '/about' ],
					[ 'badge' => 'AU/NZ-Based Support', 'title' => 'Expert Support from Real People', 'body' => 'Our AU/NZ-based team is available to help with product info, orders, and documentation.', 'cta_label' => '', 'cta_href' => '' ],
					[ 'badge' => 'Volume Discounts', 'title' => 'Bulk Pricing for Larger Orders', 'body' => 'Volume-based pricing for laboratories and larger research operations. Contact us to discuss your needs.', 'cta_label' => 'Contact Us', 'cta_href' => '/contact' ],
				],
			],
			'testimonials' => [
				'headline' => 'What Researchers Are Saying',
				'reviews' => [
					[ 'name' => 'Derek M.', 'stars' => 5, 'text' => "The COA was already posted before my order even shipped. That kind of documentation is rare - most suppliers make you ask for it.", 'date' => 'June 2, 2026' ],
					[ 'name' => 'Priya S.', 'stars' => 5, 'text' => 'Third order with Longevity Peptides. Purity has been consistent batch to batch, and their support team actually understands the products they sell.', 'date' => 'May 21, 2026' ],
					[ 'name' => 'Anthony R.', 'stars' => 5, 'text' => "Packaging was solid, shipping was fast, and the batch number on the vial matched the COA on their site exactly. That's what I look for.", 'date' => 'June 14, 2026' ],
				],
			],
			'banner' => [
				'text'      => 'New Here? Create an account and get 10% off your first order.',
				'cta_label' => 'Create Account',
				'cta_href'  => '/account',
			],
		];
	}

	private static function default_about(): array {
		return [
			'hero' => [
				'eyebrow'   => 'Longevity Peptides',
				'headline'  => 'About Us',
				'body'      => 'A science-first peptide company built on transparency, analytical rigor, and a relentless commitment to researcher success.',
				'image_url' => '',
			],
			'brand_story' => [
				'eyebrow'  => 'Our Story',
				'headline' => "BUILT BY RESEARCHERS, FOR RESEARCH.",
				'paragraphs' => [
					"Longevity Peptides was founded with a single purpose: to give researchers access to the highest-quality peptides available - backed by real analytical data, not marketing promises.",
					"We recognized a gap in the market. Too many suppliers were offering underdocumented, inconsistently manufactured peptides that undermined research outcomes. We built Longevity Peptides to be different - a company where scientific transparency isn't a selling point, it's the baseline.",
					"Every peptide we sell is purified to research-grade standards and independently verified by certified third-party labs before it ships to Australia or New Zealand. We publish our Certificates of Analysis publicly because we have nothing to hide and everything to prove.",
					"We're advancing the science of peptide research - one verified vial at a time.",
				],
				'stat_value' => '5+',
				'stat_label' => 'Years of Experience',
				'image_url'  => '',
			],
			'values' => [
				'eyebrow'  => 'What We Stand For',
				'headline' => 'Our Values',
				'items' => [
					[ 'title' => 'Scientific Integrity', 'desc' => "Every product we offer is grounded in peer-reviewed research and validated analytical methods. We don't cut corners - not in lyophilization, not in testing, not in documentation." ],
					[ 'title' => 'Uncompromising Purity', 'desc' => 'Each batch is independently verified by certified third-party laboratories using HPLC, mass spectrometry, and endotoxin screening. COAs for every batch are published on our site - fully transparent, always accessible before you order.' ],
					[ 'title' => 'Verified for AU & NZ Research', 'desc' => 'Every batch is independently tested and documented before it ships to Australia or New Zealand, with compliance handled to TGA standards rather than a US-market framework.' ],
					[ 'title' => 'Researcher-First Support', 'desc' => 'Our AU/NZ-based team is available to help. Whether you need product documentation, order help, or research guidance - real people answer.' ],
					[ 'title' => 'Transparent Documentation', 'desc' => 'We publish Certificates of Analysis for every product. No black boxes, no marketing fluff - just raw analytical data you can trust and cite.' ],
					[ 'title' => 'Researcher Community', 'desc' => "New accounts get 10% off their first order. We're building long-term relationships with the labs and researchers who rely on us." ],
				],
			],
			'service_cta' => [
				'eyebrow'   => 'Join Our Community',
				'headline'  => 'Research-Grade, Every Batch',
				'body'      => 'New here? Create an account and get 10% off your first order.',
				'cta_primary_label'   => 'Create Account',
				'cta_primary_href'    => '/account',
				'cta_secondary_label' => 'Contact Us',
				'cta_secondary_href'  => '/contact',
				'image_url'           => '',
			],
		];
	}

	private static function default_contact(): array {
		return [
			'hero' => [
				'eyebrow'  => 'Support',
				'headline' => 'Contact Us',
				'body'     => 'Questions about products, orders, or research applications? Our team is here to help.',
			],
			'sidebar' => [
				'phone'          => '',
				'phone_note'     => 'Update with a real AU/NZ contact number in wp-admin',
				'email'          => 'support@longevitytech-lab.com',
				'email_note'     => 'We reply within 24 hours',
				'location_line1' => 'Australia & New Zealand',
				'location_line2' => 'Shipping AU & NZ only',
				'hours_line1'    => 'Mon – Fri',
				'hours_line2'    => '9:00 AM – 5:00 PM AEST',
				'promo_title'    => '10% Off Your First Order',
				'promo_body'     => 'Create an account to unlock 10% off your first order.',
			],
		];
	}

	private static function default_faq(): array {
		return [
			'categories' => [
				[ 'label' => 'About Peptides', 'items' => [
					[ 'q' => 'What are peptides?', 'a' => 'Peptides are short chains of amino acids linked by peptide bonds. They serve as the building blocks for proteins and play a critical role in many biological processes. In research settings, synthetic peptides are used to study cellular signaling, protein interactions, and other biochemical mechanisms.' ],
					[ 'q' => 'What is the difference between a peptide and a protein?', 'a' => 'Peptides are typically shorter chains of amino acids (usually fewer than 50), while proteins are longer and more complex. The distinction influences how they are lyophilized, stored, and behave in research environments.' ],
					[ 'q' => 'Are your peptides synthetic or naturally derived?', 'a' => 'All Longevity Peptides products are manufactured using solid-phase peptide synthesis (SPPS) and then lyophilized. This ensures precise amino acid sequences, high reproducibility, and consistent purity across batches.' ],
				] ],
				[ 'label' => 'Purity & Testing', 'items' => [
					[ 'q' => 'Are your Peptides third-party tested?', 'a' => 'Yes. All Longevity Peptides products undergo rigorous third-party testing through accredited independent laboratories. Testing includes HPLC purity analysis, mass spectrometry identity confirmation, endotoxin testing, sterility testing, and heavy metal screening. Certificates of Analysis (COAs) are available for each product.' ],
					[ 'q' => 'What purity levels do your peptides meet?', 'a' => 'Our peptides are manufactured to achieve 99%+ purity as verified by HPLC analysis. Each batch is tested individually and must pass all quality control criteria before being released for sale.' ],
					[ 'q' => 'Do you provide Certificates of Analysis (COAs)?', 'a' => 'Yes. When available, products include supporting documentation such as Certificates of Analysis (COAs) outlining purity, composition, and quality control results. You can view all COAs on our dedicated COA page.' ],
					[ 'q' => 'How is product quality verified?', 'a' => 'Longevity Peptides works exclusively with certified third-party testing labs to independently verify every batch before it ships, regardless of where a given compound is synthesized. Certificates of Analysis are published for every batch.' ],
				] ],
				[ 'label' => 'Ordering & Payment', 'items' => [
					[ 'q' => 'What payment methods do you accept?', 'a' => 'We accept all major credit cards (Visa, Mastercard) via our secure checkout, processed by NiftiPay. All transactions are encrypted for your security.' ],
					[ 'q' => 'Can I change or cancel my order?', 'a' => 'Orders can be modified or cancelled within a short window after placement. Please contact our support team as quickly as possible via our contact form. Once an order has been processed and shipped, modifications may not be possible.' ],
					[ 'q' => 'Do you offer bulk pricing?', 'a' => 'Volume-based pricing may be offered on certain products. Please reach out to our support team directly to inquire about bulk order pricing for research institutions or multi-unit purchases.' ],
					[ 'q' => 'Do you offer a first-time buyer discount?', 'a' => "Yes. Create an account and you'll automatically receive 10% off your first order." ],
				] ],
				[ 'label' => 'Shipping & Delivery', 'items' => [
					[ 'q' => 'How fast do you ship?', 'a' => 'Orders are typically shipped within 1–2 business days following processing. Delivery times vary by carrier and destination within Australia and New Zealand. You will receive tracking information via email once your order has been dispatched.' ],
					[ 'q' => 'Which countries do you ship to?', 'a' => 'We currently ship to Australia and New Zealand only. Shipping outside these two markets is not available at this time.' ],
					[ 'q' => 'How are peptides packaged for shipping?', 'a' => 'All lyophilized peptides are shipped in sealed, labeled vials with protective packaging to maintain product integrity during transit.' ],
					[ 'q' => 'What if my order arrives damaged?', 'a' => 'If your order arrives damaged, please contact us within 48 hours of delivery with photos of the damage and your order number. We will arrange a replacement or refund at no cost to you.' ],
				] ],
				[ 'label' => 'Storage & Handling', 'items' => [
					[ 'q' => 'How should lyophilized peptides be stored?', 'a' => "In published research protocols, lyophilized (freeze-dried) peptides are typically stored at -20°C in a frost-free freezer, protected from light and moisture. Qualified researchers should always follow the product-specific Certificate of Analysis and their institution's laboratory handling protocols. Products are for research use only and are not intended for human consumption." ],
					[ 'q' => 'Do you provide reconstitution instructions?', 'a' => "We do not provide step-by-step reconstitution or administration instructions, as our products are sold strictly for in vitro and laboratory research use, not for human or animal use. Qualified researchers should follow their institution's standard laboratory protocols and any applicable safety data sheet." ],
					[ 'q' => 'What is the shelf life of your peptides?', 'a' => 'Properly stored lyophilized peptides are generally stable for 24 months or longer per published research data. Refer to the Certificate of Analysis and product label for specific stability and storage guidance relevant to your research application.' ],
				] ],
				[ 'label' => 'Research Use Only', 'items' => [
					[ 'q' => 'Are your products safe for human use?', 'a' => 'All products are sold strictly for research use only. They are NOT intended for human consumption, injection, or any form of medical or therapeutic use. These products are sold exclusively to qualified researchers and laboratories for in vitro and laboratory research purposes.' ],
					[ 'q' => 'Who can purchase from Longevity Peptides?', 'a' => 'Our products are intended for purchase by qualified scientists, researchers, and authorized representatives of research institutions in Australia and New Zealand. By purchasing, you confirm you are 18+ years of age and will use the products only for legitimate in vitro research purposes in a controlled laboratory environment.' ],
					[ 'q' => 'Are Longevity Peptides products TGA approved?', 'a' => "No. Our products are research chemicals and have not been evaluated or approved by Australia's Therapeutic Goods Administration (TGA) or any equivalent body. They are not intended to diagnose, treat, cure, or prevent any disease or medical condition. Longevity Peptides is a research chemical supplier, not a pharmaceutical company or compounding pharmacy." ],
				] ],
			],
		];
	}

	private static function default_shop(): array {
		return [
			'hero' => [
				'announcement' => '✦ New products being added weekly - check back! ✦',
				'eyebrow'      => 'Longevity Peptides',
				'headline'     => 'Shop All Peptides',
				'body'         => 'Research-grade peptides, independently verified and shipped to Australia and New Zealand. Every product 3rd-party tested for purity, identity, and composition.',
			],
		];
	}

	private static function default_coa(): array {
		return [
			'hero' => [
				'eyebrow'  => 'Longevity Peptides',
				'headline' => 'Certificates Of Analysis',
				'body'     => 'Every batch independently verified by certified third-party laboratories. Full documentation publicly available for complete transparency.',
			],
		];
	}

	/**
	 * Legal page bodies are long, section-heavy prose (see
	 * the frontend's legal page components) - modeled as one rich-text/HTML blob per page
	 * (edited via wp_kses_post) rather than granular fields, per the CMS
	 * scope. Defaults are intentionally left empty here: until an admin
	 * fills these in from wp-admin, the frontend-wiring phase should keep
	 * falling back to the hardcoded React copy for these four pages rather
	 * than rendering blank legal text. See CMS_CONTENT_MODEL.md for the
	 * flag on this.
	 */
	private static function default_legal(): array {
		return [
			'privacy_policy' => [ 'title' => 'Privacy Policy', 'body' => '' ],
			'terms_conditions' => [ 'title' => 'Terms & Conditions', 'body' => '' ],
			'return_policy' => [ 'title' => 'Return Policy', 'body' => '' ],
			'research_use_only' => [ 'title' => 'Research Use Only Policy', 'body' => '' ],
		];
	}

	private static function default_footer(): array {
		return [
			'brand_body' => 'Premium research-grade peptides engineered for consistency, stability, and analytical reliability. All products are for research use only.',
			'ruo_disclaimer' => "Products are sold strictly for in-vitro research and laboratory use only. Not for human or veterinary consumption. The statements made on this website have not been evaluated by Australia's Therapeutic Goods Administration (TGA) or any equivalent body in New Zealand. Longevity Peptides is a research chemical supplier, not a compounding pharmacy or therapeutic goods manufacturer.",
			'quick_links' => [
				[ 'label' => 'Shop All Peptides', 'href' => '/shop' ],
				[ 'label' => 'COAs', 'href' => '/coa' ],
				[ 'label' => 'FAQ', 'href' => '/faq' ],
				[ 'label' => 'About Us', 'href' => '/about' ],
				[ 'label' => 'Blog / News', 'href' => '/blog' ],
				[ 'label' => 'My Account', 'href' => '/account' ],
				[ 'label' => 'Lab Affiliate Program', 'href' => 'https://affiliate.longevitytech-lab.com/' ],
			],
			'compliance_links' => [
				[ 'label' => 'Contact Us', 'href' => '/contact' ],
				[ 'label' => 'Shipping & Returns', 'href' => '/legal/shipping-returns' ],
				[ 'label' => 'Privacy Policy', 'href' => '/legal/privacy' ],
				[ 'label' => 'Research Use Only Policy', 'href' => '/legal/research-use' ],
				[ 'label' => 'Terms & Conditions', 'href' => '/legal/terms' ],
			],
			'cta' => [
				'eyebrow'  => 'Ready to Start?',
				'headline' => "Premium Peptides. Proven Quality. Elevate Your Research.",
				'body'     => 'Research-grade peptides, independently verified and shipped to Australia and New Zealand. Fast dispatch, full documentation, expert support.',
			],
			'newsletter' => [
				'title' => 'Newsletter',
				'body'  => 'Sign up to receive our special offers.',
			],
			'payment_methods' => [
				[ 'label' => 'Visa / Mastercard', 'sub' => 'Secure checkout via NiftiPay' ],
			],
			'copyright' => 'Copyright © 2026 Longevity Peptides. All rights reserved.',
		];
	}

	// ---------------------------------------------------------------
	// Read
	// ---------------------------------------------------------------

	/** Get one page bundle, merged over defaults so a fresh/partial install still returns complete data. */
	public static function get_page( string $page ): array {
		$defaults = self::get_defaults( $page );
		$stored   = get_option( self::option_name( $page ), null );
		if ( ! is_array( $stored ) ) {
			return $defaults;
		}
		return self::deep_merge( $defaults, $stored );
	}

	public static function get_all(): array {
		$out = [];
		foreach ( self::PAGES as $page ) {
			$out[ $page ] = self::get_page( $page );
		}
		return $out;
	}

	/** Recursively overlay $override onto $base, keyed by array key (works for both assoc data and numeric repeater lists - a present override list fully replaces the default list). */
	private static function deep_merge( array $base, array $override ): array {
		foreach ( $override as $key => $value ) {
			if ( is_array( $value ) && isset( $base[ $key ] ) && is_array( $base[ $key ] ) && ! self::is_list( $value ) ) {
				$base[ $key ] = self::deep_merge( $base[ $key ], $value );
			} else {
				$base[ $key ] = $value;
			}
		}
		return $base;
	}

	private static function is_list( array $arr ): bool {
		return array_keys( $arr ) === range( 0, count( $arr ) - 1 );
	}

	// ---------------------------------------------------------------
	// Write (shared by the REST POST route and the admin-post handler)
	// ---------------------------------------------------------------

	/**
	 * Sanitize and save one page bundle. $raw is the untrusted input (from
	 * either $_POST, already wp_unslash()'d, or a decoded JSON body).
	 * Rich-text/HTML fields (legal bodies) go through wp_kses_post();
	 * everything else through sanitize_text_field() (or sanitize_textarea_field()
	 * for long-form plain text, which preserves line breaks).
	 */
	public static function save_page( string $page, array $raw ): array {
		$clean = self::sanitize_page( $page, $raw );
		update_option( self::option_name( $page ), $clean, false ); // autoload off
		return $clean;
	}

	private static function sanitize_page( string $page, array $raw ): array {
		if ( $page === 'legal' ) {
			$clean = [];
			foreach ( [ 'privacy_policy', 'terms_conditions', 'return_policy', 'research_use_only' ] as $slug ) {
				$entry = $raw[ $slug ] ?? [];
				$clean[ $slug ] = [
					'title' => sanitize_text_field( $entry['title'] ?? '' ),
					'body'  => wp_kses_post( $entry['body'] ?? '' ),
				];
			}
			return $clean;
		}

		return self::sanitize_recursive( $raw );
	}

	/**
	 * Generic recursive sanitizer for every non-legal page: strings go
	 * through sanitize_textarea_field() (safe for both single-line and
	 * multi-line copy, strips tags but keeps line breaks), numeric-looking
	 * scalars are left as-is, arrays (both repeaters and nested sections)
	 * recurse.
	 */
	private static function sanitize_recursive( $value, string $key = '' ) {
		if ( is_array( $value ) ) {
			$out = [];
			foreach ( $value as $k => $v ) {
				$ck        = is_string( $k ) ? sanitize_key( $k ) : $k;
				$out[ $ck ] = self::sanitize_recursive( $v, is_string( $ck ) ? $ck : '' );
			}
			return $out;
		}
		if ( is_bool( $value ) || is_int( $value ) || is_float( $value ) ) {
			return $value;
		}
		// image_url fields hold a media-library URL, not free-text copy -
		// esc_url_raw() (not sanitize_textarea_field(), which would mangle
		// query strings some media URLs carry) is the correct sanitizer here.
		if ( $key === 'image_url' ) {
			return esc_url_raw( (string) $value );
		}
		return sanitize_textarea_field( (string) $value );
	}

	// ---------------------------------------------------------------
	// REST API - longevity/v1/cms, longevity/v1/cms/{page}
	// ---------------------------------------------------------------

	public static function register_routes() {
		register_rest_route( 'longevity/v1', '/cms', [
			'methods'             => 'GET',
			'callback'            => [ __CLASS__, 'rest_get_all' ],
			'permission_callback' => '__return_true',
		] );

		register_rest_route( 'longevity/v1', '/cms/(?P<page>[a-z]+)', [
			'methods'             => 'GET',
			'callback'            => [ __CLASS__, 'rest_get_page' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'page' => [ 'required' => true, 'type' => 'string' ],
			],
		] );

		register_rest_route( 'longevity/v1', '/cms/(?P<page>[a-z]+)', [
			'methods'             => 'POST',
			'callback'            => [ __CLASS__, 'rest_save_page' ],
			'permission_callback' => [ __CLASS__, 'rest_can_edit' ],
			'args'                => [
				'page' => [ 'required' => true, 'type' => 'string' ],
			],
		] );
	}

	public static function rest_can_edit(): bool {
		return current_user_can( 'manage_options' );
	}

	public static function rest_get_all(): WP_REST_Response {
		return new WP_REST_Response( self::get_all(), 200 );
	}

	public static function rest_get_page( WP_REST_Request $req ) {
		$page = $req->get_param( 'page' );
		if ( ! in_array( $page, self::PAGES, true ) ) {
			return new WP_REST_Response( [ 'error' => "Unknown CMS page '{$page}'." ], 404 );
		}
		return new WP_REST_Response( self::get_page( $page ), 200 );
	}

	public static function rest_save_page( WP_REST_Request $req ) {
		$page = $req->get_param( 'page' );
		if ( ! in_array( $page, self::PAGES, true ) ) {
			return new WP_REST_Response( [ 'error' => "Unknown CMS page '{$page}'." ], 404 );
		}

		$nonce = $req->get_header( 'X-WP-Nonce' );
		if ( ! $nonce || ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new WP_REST_Response( [ 'error' => 'Invalid or missing nonce.' ], 403 );
		}

		$body = json_decode( $req->get_body(), true );
		if ( ! is_array( $body ) ) {
			return new WP_REST_Response( [ 'error' => 'Request body must be a JSON object matching this page\'s shape.' ], 400 );
		}

		$saved = self::save_page( $page, $body );
		return new WP_REST_Response( $saved, 200 );
	}

	// ---------------------------------------------------------------
	// Admin UI
	// ---------------------------------------------------------------

	public static function add_menu() {
		$hook = add_submenu_page(
			'longevity-content-manager',
			'Longevity Peptides Content (CMS)',
			'Content (CMS)',
			'manage_options',
			'longevity-cms',
			[ __CLASS__, 'render' ]
		);
		add_action( 'admin_enqueue_scripts', function ( $current_hook ) use ( $hook ) {
			if ( $current_hook === $hook ) {
				wp_enqueue_media(); // registers wp.media() for the image-picker fields below
			}
		} );
	}

	public static function handle_admin_post() {
		if ( ! current_user_can( 'manage_options' ) || ! check_admin_referer( 'lpcm_save_cms' ) ) {
			wp_die( 'Not allowed.' );
		}

		$page = isset( $_POST['lpcm_cms_page'] ) ? sanitize_key( wp_unslash( $_POST['lpcm_cms_page'] ) ) : '';
		if ( ! in_array( $page, self::PAGES, true ) ) {
			wp_die( 'Unknown CMS page.' );
		}

		$raw = isset( $_POST['data'] ) ? wp_unslash( $_POST['data'] ) : [];
		if ( ! is_array( $raw ) ) {
			$raw = [];
		}

		self::save_page( $page, $raw );

		wp_safe_redirect( admin_url( 'admin.php?page=longevity-cms&tab=' . $page . '&saved=1' ) );
		exit;
	}

	public static function render() {
		$active_tab = isset( $_GET['tab'] ) && in_array( $_GET['tab'], self::PAGES, true ) ? $_GET['tab'] : 'home';
		$saved      = isset( $_GET['saved'] );
		$data       = self::get_all();
		?>
		<div class="wrap">
			<h1>Longevity Peptides Content (CMS)</h1>
			<p style="font-size:13px;color:#555;max-width:720px;">
				Edit the marketing copy shown across the public site - hero text, About/FAQ/Contact/Shop/COA
				page copy, testimonials, footer links, and legal page bodies. Blog posts and product/COA
				data are managed elsewhere (Posts, and Product Tools) - not here.
			</p>

			<?php if ( $saved ) : ?>
				<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:14px 16px;border-radius:4px;margin:16px 0;max-width:720px;">
					<p style="font-weight:700;color:#166534;margin:0;">Saved!</p>
				</div>
			<?php endif; ?>

			<h2 class="nav-tab-wrapper" style="margin-bottom:20px;">
				<?php foreach ( self::PAGES as $p ) : ?>
					<a href="#" class="nav-tab wrouter-cms-tab<?php echo $p === $active_tab ? ' nav-tab-active' : ''; ?>" data-tab="<?php echo esc_attr( $p ); ?>">
						<?php echo esc_html( ucfirst( str_replace( '_', ' ', $p ) ) ); ?>
					</a>
				<?php endforeach; ?>
			</h2>

			<?php foreach ( self::PAGES as $p ) : ?>
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>"
					class="wrouter-cms-panel" data-panel="<?php echo esc_attr( $p ); ?>"
					style="<?php echo $p === $active_tab ? '' : 'display:none;'; ?>background:#fff;border:1px solid #e0e0e0;padding:24px;max-width:860px;border-radius:4px;">
					<input type="hidden" name="action" value="lpcm_save_cms">
					<input type="hidden" name="lpcm_cms_page" value="<?php echo esc_attr( $p ); ?>">
					<?php wp_nonce_field( 'lpcm_save_cms' ); ?>

					<?php self::render_fields( $p, $data[ $p ] ); ?>

					<p style="margin-top:20px;">
						<button type="submit" class="button button-primary" style="font-size:14px;height:38px;padding:0 20px;">
							Save <?php echo esc_html( ucfirst( $p ) ); ?>
						</button>
					</p>
				</form>
			<?php endforeach; ?>
		</div>

		<style>
			.wrouter-cms-field { margin-bottom: 16px; }
			.wrouter-cms-field label { display:block; font-weight:600; font-size:12px; margin-bottom:4px; color:#333; }
			.wrouter-cms-field input[type=text], .wrouter-cms-field textarea { width:100%; max-width:100%; font-size:13px; }
			.wrouter-cms-section { border:1px solid #e5e7eb; border-radius:6px; padding:16px; margin-bottom:20px; background:#fafafa; }
			.wrouter-cms-section > h3 { margin-top:0; font-size:14px; text-transform:uppercase; letter-spacing:.04em; color:#111; }
			.wrouter-cms-repeater-row { border:1px solid #e5e7eb; border-radius:6px; padding:12px; margin-bottom:10px; background:#fff; position:relative; }
			.wrouter-cms-repeater-row .wrouter-cms-remove-row { position:absolute; top:8px; right:8px; }
		</style>
		<script>
		(function(){
			document.querySelectorAll('.wrouter-cms-tab').forEach(function(tab){
				tab.addEventListener('click', function(e){
					e.preventDefault();
					document.querySelectorAll('.wrouter-cms-tab').forEach(function(t){ t.classList.remove('nav-tab-active'); });
					document.querySelectorAll('.wrouter-cms-panel').forEach(function(p){ p.style.display = 'none'; });
					tab.classList.add('nav-tab-active');
					var name = tab.getAttribute('data-tab');
					var panel = document.querySelector('.wrouter-cms-panel[data-panel="' + name + '"]');
					if (panel) panel.style.display = '';
					if (history.replaceState) {
						var url = new URL(window.location.href);
						url.searchParams.set('tab', name);
						history.replaceState(null, '', url);
					}
				});
			});

			// Repeater "+ Add row" / "Remove" - clones the last row in the
			// repeater, clears its inputs, and renumbers every row's
			// name="…[N][field]" indexes so PHP's $_POST parses a clean,
			// contiguous array regardless of add/remove order.
			document.querySelectorAll('.wrouter-cms-add-row').forEach(function(btn){
				btn.addEventListener('click', function(e){
					e.preventDefault();
					var listEl = document.querySelector('[data-repeater="' + btn.getAttribute('data-repeater') + '"]');
					if (!listEl) return;
					var rows = listEl.querySelectorAll('.wrouter-cms-repeater-row');
					var template = rows[rows.length - 1] || listEl.querySelector('.wrouter-cms-row-template');
					if (!template) return;
					var clone = template.cloneNode(true);
					clone.classList.remove('wrouter-cms-row-template');
					clone.style.display = '';
					clone.querySelectorAll('input, textarea').forEach(function(el){ el.value = ''; });
					listEl.appendChild(clone);
					reindex(listEl);
				});
			});
			document.addEventListener('click', function(e){
				if (e.target.classList.contains('wrouter-cms-remove-row')) {
					e.preventDefault();
					var row = e.target.closest('.wrouter-cms-repeater-row');
					var listEl = row.closest('[data-repeater]');
					row.remove();
					reindex(listEl);
				}
			});
			function reindex(listEl) {
				var rows = listEl.querySelectorAll('.wrouter-cms-repeater-row:not(.wrouter-cms-row-template)');
				rows.forEach(function(row, i){
					row.querySelectorAll('[name]').forEach(function(el){
						el.name = el.name.replace(/\[\d+\]/, '[' + i + ']');
					});
				});
			}

			// Image fields - WP's own media library (wp.media()), not a custom
			// uploader. One frame instance per "Choose Image" click (delegated,
			// so this works for fields added dynamically too, though none of
			// today's image fields live inside a repeater).
			document.addEventListener('click', function(e){
				if (!e.target.classList.contains('wrouter-cms-choose-image')) return;
				e.preventDefault();
				if (typeof wp === 'undefined' || !wp.media) return;
				var field = e.target.closest('.wrouter-cms-image-field');
				var input = field.querySelector('.wrouter-cms-image-url');
				var preview = field.querySelector('.wrouter-cms-image-preview');
				var clearBtn = field.querySelector('.wrouter-cms-clear-image');
				var frame = wp.media({ title: 'Choose Image', library: { type: 'image' }, multiple: false });
				frame.on('select', function () {
					var att = frame.state().get('selection').first().toJSON();
					var url = (att.sizes && att.sizes.large) ? att.sizes.large.url : att.url;
					input.value = url;
					preview.querySelector('img').src = url;
					preview.style.display = '';
					clearBtn.style.display = '';
				});
				frame.open();
			});
			document.addEventListener('click', function(e){
				if (!e.target.classList.contains('wrouter-cms-clear-image')) return;
				e.preventDefault();
				var field = e.target.closest('.wrouter-cms-image-field');
				field.querySelector('.wrouter-cms-image-url').value = '';
				field.querySelector('.wrouter-cms-image-preview').style.display = 'none';
				e.target.style.display = 'none';
			});
		})();
		</script>
		<?php
	}

	/** Dispatches to the right field renderer per page - keeps the form markup close to each page's actual shape instead of one generic recursive form (which reads badly for a mixed bag of sections/repeaters like this). */
	private static function render_fields( string $page, array $data ) {
		switch ( $page ) {
			case 'home':
				self::render_home_fields( $data );
				break;
			case 'about':
				self::render_about_fields( $data );
				break;
			case 'contact':
				self::render_contact_fields( $data );
				break;
			case 'faq':
				self::render_faq_fields( $data );
				break;
			case 'shop':
				self::render_shop_fields( $data );
				break;
			case 'coa':
				self::render_coa_fields( $data );
				break;
			case 'legal':
				self::render_legal_fields( $data );
				break;
			case 'footer':
				self::render_footer_fields( $data );
				break;
		}
	}

	private static function text_field( string $name, string $label, string $value, bool $area = false ) {
		echo '<div class="wrouter-cms-field"><label for="' . esc_attr( $name ) . '">' . esc_html( $label ) . '</label>';
		if ( $area ) {
			echo '<textarea name="' . esc_attr( $name ) . '" rows="3">' . esc_textarea( $value ) . '</textarea>';
		} else {
			echo '<input type="text" name="' . esc_attr( $name ) . '" value="' . esc_attr( $value ) . '">';
		}
		echo '</div>';
	}

	/**
	 * Image field - a text input holding the chosen image's URL (so it's
	 * still saved the same way every other field is, no separate media
	 * storage), plus a thumbnail preview and a "Choose Image" button that
	 * opens WordPress's own media library (wp.media()) - uploads, existing
	 * library images, and cropping are all handled by WP core, nothing
	 * custom-built here. See the wp.media() wiring in the <script> block
	 * in render() (init'd once against every .wrouter-cms-image-field on
	 * the page via event delegation, not per-field, so this stays cheap
	 * regardless of how many image fields a page ends up with).
	 */
	private static function image_field( string $name, string $label, string $value ) {
		echo '<div class="wrouter-cms-field wrouter-cms-image-field">';
		echo '<label for="' . esc_attr( $name ) . '">' . esc_html( $label ) . '</label>';
		echo '<div class="wrouter-cms-image-preview" style="' . ( $value ? '' : 'display:none;' ) . 'margin-bottom:8px;">';
		echo '<img src="' . esc_url( $value ) . '" style="max-width:220px;max-height:140px;display:block;border:1px solid #e0e0e0;border-radius:4px;">';
		echo '</div>';
		echo '<input type="text" class="wrouter-cms-image-url" name="' . esc_attr( $name ) . '" value="' . esc_attr( $value ) . '" placeholder="No image chosen" readonly style="background:#f6f7f7;">';
		echo ' <button type="button" class="button wrouter-cms-choose-image">Choose Image</button>';
		echo ' <button type="button" class="button wrouter-cms-clear-image"' . ( $value ? '' : ' style="display:none;"' ) . '>Remove</button>';
		echo '</div>';
	}

	/**
	 * Renders one repeater section: existing rows (each a set of
	 * text_field()s built by $row_cb) plus a hidden "template" row (for
	 * cloning on "+ Add row") and the add button. $row_cb receives
	 * ($name_prefix, $row_data).
	 */
	private static function repeater( string $repeater_key, string $label, string $field_base, array $rows, callable $row_cb ) {
		echo '<div class="wrouter-cms-section"><h3>' . esc_html( $label ) . '</h3>';
		echo '<div data-repeater="' . esc_attr( $repeater_key ) . '">';
		if ( empty( $rows ) ) {
			$rows = [ [] ]; // always show at least one editable row
		}
		foreach ( array_values( $rows ) as $i => $row ) {
			echo '<div class="wrouter-cms-repeater-row">';
			echo '<button type="button" class="button-link-delete wrouter-cms-remove-row">Remove</button>';
			$row_cb( $field_base . '[' . $i . ']', $row );
			echo '</div>';
		}
		echo '</div>';
		echo '<button type="button" class="button wrouter-cms-add-row" data-repeater="' . esc_attr( $repeater_key ) . '">+ Add row</button>';
		echo '</div>';
	}

	// --- home ---
	private static function render_home_fields( array $d ) {
		$hero = $d['hero'];
		echo '<div class="wrouter-cms-section"><h3>Hero</h3>';
		self::text_field( 'data[hero][badge_text]', 'Badge text', $hero['badge_text'] );
		self::text_field( 'data[hero][overline_text]', 'Overline text', $hero['overline_text'] );
		self::text_field( 'data[hero][headline_line1]', 'Headline line 1', $hero['headline_line1'] );
		self::text_field( 'data[hero][headline_line2]', 'Headline line 2', $hero['headline_line2'] );
		self::text_field( 'data[hero][headline_line3]', 'Headline line 3', $hero['headline_line3'] );
		self::text_field( 'data[hero][body_text]', 'Body text', $hero['body_text'], true );
		self::text_field( 'data[hero][disclaimer_text]', 'Disclaimer text', $hero['disclaimer_text'] );
		self::text_field( 'data[hero][cta_primary_label]', 'Primary CTA label', $hero['cta_primary_label'] );
		self::text_field( 'data[hero][cta_primary_href]', 'Primary CTA link', $hero['cta_primary_href'] );
		self::text_field( 'data[hero][cta_secondary_label]', 'Secondary CTA label', $hero['cta_secondary_label'] );
		self::text_field( 'data[hero][cta_secondary_href]', 'Secondary CTA link', $hero['cta_secondary_href'] );
		echo '</div>';
		self::repeater( 'hero_stats', 'Hero Stats', 'data[hero][stats]', $hero['stats'], function ( $base, $row ) {
			self::text_field( $base . '[val]', 'Value', $row['val'] ?? '' );
			self::text_field( $base . '[label]', 'Label', $row['label'] ?? '' );
		} );

		$q = $d['quality'];
		echo '<div class="wrouter-cms-section"><h3>Quality Section</h3>';
		self::text_field( 'data[quality][eyebrow]', 'Eyebrow', $q['eyebrow'] );
		self::text_field( 'data[quality][headline]', 'Headline', $q['headline'] );
		self::text_field( 'data[quality][body]', 'Body', $q['body'], true );
		self::image_field( 'data[quality][image_url]', 'Background image (falls back to the built-in placeholder graphic if empty)', $q['image_url'] ?? '' );
		echo '</div>';
		self::repeater( 'quality_metrics', 'Quality — Overlay Metric Badges', 'data[quality][metrics]', $q['metrics'], function ( $base, $row ) {
			self::text_field( $base . '[val]', 'Value', $row['val'] ?? '' );
			self::text_field( $base . '[label]', 'Label', $row['label'] ?? '' );
		} );
		self::repeater( 'quality_timeline', 'Quality — 4-Step Timeline', 'data[quality][timeline]', $q['timeline'], function ( $base, $row ) {
			self::text_field( $base . '[title]', 'Step title', $row['title'] ?? '' );
			self::text_field( $base . '[detail]', 'Step detail', $row['detail'] ?? '', true );
		} );

		$b = $d['bento'];
		echo '<div class="wrouter-cms-section"><h3>Curated Compounds (Bento)</h3>';
		self::text_field( 'data[bento][headline]', 'Headline', $b['headline'] );
		echo '</div>';
		self::repeater( 'bento_tiles', 'Bento — Category Tiles', 'data[bento][tiles]', $b['tiles'], function ( $base, $row ) {
			self::text_field( $base . '[name]', 'Category name', $row['name'] ?? '' );
			self::text_field( $base . '[summary]', 'Summary', $row['summary'] ?? '', true );
		} );

		$fc = $d['feature_cards'];
		echo '<div class="wrouter-cms-section"><h3>Commitment / Feature Cards</h3>';
		self::text_field( 'data[feature_cards][eyebrow]', 'Eyebrow', $fc['eyebrow'] );
		self::text_field( 'data[feature_cards][headline]', 'Headline', $fc['headline'] );
		self::text_field( 'data[feature_cards][body]', 'Body', $fc['body'], true );
		echo '</div>';
		self::repeater( 'feature_cards_list', 'Feature Cards (3)', 'data[feature_cards][cards]', $fc['cards'], function ( $base, $row ) {
			self::text_field( $base . '[badge]', 'Badge', $row['badge'] ?? '' );
			self::text_field( $base . '[title]', 'Title', $row['title'] ?? '' );
			self::text_field( $base . '[body]', 'Body', $row['body'] ?? '', true );
			self::text_field( $base . '[cta_label]', 'CTA label (blank = no CTA)', $row['cta_label'] ?? '' );
			self::text_field( $base . '[cta_href]', 'CTA link', $row['cta_href'] ?? '' );
		} );

		$t = $d['testimonials'];
		echo '<div class="wrouter-cms-section"><h3>Testimonials</h3>';
		self::text_field( 'data[testimonials][headline]', 'Headline', $t['headline'] );
		echo '</div>';
		self::repeater( 'testimonial_reviews', 'Reviews', 'data[testimonials][reviews]', $t['reviews'], function ( $base, $row ) {
			self::text_field( $base . '[name]', 'Name', $row['name'] ?? '' );
			self::text_field( $base . '[stars]', 'Stars (1-5)', (string) ( $row['stars'] ?? 5 ) );
			self::text_field( $base . '[text]', 'Review text', $row['text'] ?? '', true );
			self::text_field( $base . '[date]', 'Date', $row['date'] ?? '' );
		} );

		$banner = $d['banner'];
		echo '<div class="wrouter-cms-section"><h3>Account Promo Banner</h3>';
		self::text_field( 'data[banner][text]', 'Banner text', $banner['text'] );
		self::text_field( 'data[banner][cta_label]', 'CTA label', $banner['cta_label'] );
		self::text_field( 'data[banner][cta_href]', 'CTA link', $banner['cta_href'] );
		echo '</div>';
	}

	// --- about ---
	private static function render_about_fields( array $d ) {
		$h = $d['hero'];
		echo '<div class="wrouter-cms-section"><h3>Hero</h3>';
		self::text_field( 'data[hero][eyebrow]', 'Eyebrow', $h['eyebrow'] );
		self::text_field( 'data[hero][headline]', 'Headline', $h['headline'] );
		self::text_field( 'data[hero][body]', 'Body', $h['body'], true );
		self::image_field( 'data[hero][image_url]', 'Background image (falls back to the built-in placeholder graphic if empty)', $h['image_url'] ?? '' );
		echo '</div>';

		$bs = $d['brand_story'];
		echo '<div class="wrouter-cms-section"><h3>Brand Story</h3>';
		self::text_field( 'data[brand_story][eyebrow]', 'Eyebrow', $bs['eyebrow'] );
		self::text_field( 'data[brand_story][headline]', 'Headline', $bs['headline'] );
		self::text_field( 'data[brand_story][stat_value]', 'Stat value (e.g. 5+)', $bs['stat_value'] );
		self::text_field( 'data[brand_story][stat_label]', 'Stat label', $bs['stat_label'] );
		self::image_field( 'data[brand_story][image_url]', 'Side image (falls back to the built-in placeholder graphic if empty)', $bs['image_url'] ?? '' );
		echo '</div>';
		self::repeater( 'brand_story_paragraphs', 'Brand Story — Paragraphs', 'data[brand_story][paragraphs]', array_map( fn( $p ) => [ 'text' => $p ], $bs['paragraphs'] ), function ( $base, $row ) {
			self::text_field( $base . '[text]', 'Paragraph', $row['text'] ?? '', true );
		} );

		$v = $d['values'];
		echo '<div class="wrouter-cms-section"><h3>Values</h3>';
		self::text_field( 'data[values][eyebrow]', 'Eyebrow', $v['eyebrow'] );
		self::text_field( 'data[values][headline]', 'Headline', $v['headline'] );
		echo '</div>';
		self::repeater( 'values_items', 'Values — Items (6)', 'data[values][items]', $v['items'], function ( $base, $row ) {
			self::text_field( $base . '[title]', 'Title', $row['title'] ?? '' );
			self::text_field( $base . '[desc]', 'Description', $row['desc'] ?? '', true );
		} );

		$cta = $d['service_cta'];
		echo '<div class="wrouter-cms-section"><h3>Service CTA</h3>';
		self::text_field( 'data[service_cta][eyebrow]', 'Eyebrow', $cta['eyebrow'] );
		self::text_field( 'data[service_cta][headline]', 'Headline', $cta['headline'] );
		self::text_field( 'data[service_cta][body]', 'Body', $cta['body'], true );
		self::text_field( 'data[service_cta][cta_primary_label]', 'Primary CTA label', $cta['cta_primary_label'] );
		self::text_field( 'data[service_cta][cta_primary_href]', 'Primary CTA link', $cta['cta_primary_href'] );
		self::text_field( 'data[service_cta][cta_secondary_label]', 'Secondary CTA label', $cta['cta_secondary_label'] );
		self::text_field( 'data[service_cta][cta_secondary_href]', 'Secondary CTA link', $cta['cta_secondary_href'] );
		self::image_field( 'data[service_cta][image_url]', 'Side image (falls back to the built-in placeholder graphic if empty)', $cta['image_url'] ?? '' );
		echo '</div>';
	}

	// --- contact ---
	private static function render_contact_fields( array $d ) {
		$h = $d['hero'];
		echo '<div class="wrouter-cms-section"><h3>Hero</h3>';
		self::text_field( 'data[hero][eyebrow]', 'Eyebrow', $h['eyebrow'] );
		self::text_field( 'data[hero][headline]', 'Headline', $h['headline'] );
		self::text_field( 'data[hero][body]', 'Body', $h['body'], true );
		echo '</div>';

		$s = $d['sidebar'];
		echo '<div class="wrouter-cms-section"><h3>Sidebar</h3>';
		self::text_field( 'data[sidebar][phone]', 'Phone', $s['phone'] );
		self::text_field( 'data[sidebar][phone_note]', 'Phone note', $s['phone_note'] );
		self::text_field( 'data[sidebar][email]', 'Email', $s['email'] );
		self::text_field( 'data[sidebar][email_note]', 'Email note', $s['email_note'] );
		self::text_field( 'data[sidebar][location_line1]', 'Location line 1', $s['location_line1'] );
		self::text_field( 'data[sidebar][location_line2]', 'Location line 2', $s['location_line2'] );
		self::text_field( 'data[sidebar][hours_line1]', 'Hours line 1', $s['hours_line1'] );
		self::text_field( 'data[sidebar][hours_line2]', 'Hours line 2', $s['hours_line2'] );
		self::text_field( 'data[sidebar][promo_title]', 'Promo title', $s['promo_title'] );
		self::text_field( 'data[sidebar][promo_body]', 'Promo body', $s['promo_body'], true );
		echo '</div>';
	}

	// --- faq ---
	private static function render_faq_fields( array $d ) {
		$categories = $d['categories'];
		echo '<div class="wrouter-cms-section"><h3>FAQ Categories</h3>';
		echo '<p style="font-size:12px;color:#666;">Each category has a label and its own list of Q/A items. Add/remove categories and items with the buttons below.</p>';
		echo '<div data-repeater="faq_categories">';
		if ( empty( $categories ) ) {
			$categories = [ [ 'label' => '', 'items' => [] ] ];
		}
		foreach ( array_values( $categories ) as $ci => $cat ) {
			$cat_base = 'data[categories][' . $ci . ']';
			echo '<div class="wrouter-cms-repeater-row">';
			echo '<button type="button" class="button-link-delete wrouter-cms-remove-row">Remove Category</button>';
			self::text_field( $cat_base . '[label]', 'Category label', $cat['label'] ?? '' );
			self::repeater( 'faq_items_' . $ci, 'Items', $cat_base . '[items]', $cat['items'] ?? [], function ( $base, $row ) {
				self::text_field( $base . '[q]', 'Question', $row['q'] ?? '' );
				self::text_field( $base . '[a]', 'Answer', $row['a'] ?? '', true );
			} );
			echo '</div>';
		}
		echo '</div>';
		echo '<button type="button" class="button wrouter-cms-add-row" data-repeater="faq_categories">+ Add category</button>';
		echo '</div>';
	}

	// --- shop ---
	private static function render_shop_fields( array $d ) {
		$h = $d['hero'];
		echo '<div class="wrouter-cms-section"><h3>Hero</h3>';
		self::text_field( 'data[hero][announcement]', 'Announcement banner text', $h['announcement'] );
		self::text_field( 'data[hero][eyebrow]', 'Eyebrow', $h['eyebrow'] );
		self::text_field( 'data[hero][headline]', 'Headline', $h['headline'] );
		self::text_field( 'data[hero][body]', 'Body', $h['body'], true );
		echo '</div>';
	}

	// --- coa ---
	private static function render_coa_fields( array $d ) {
		$h = $d['hero'];
		echo '<div class="wrouter-cms-section"><h3>Hero</h3>';
		self::text_field( 'data[hero][eyebrow]', 'Eyebrow', $h['eyebrow'] );
		self::text_field( 'data[hero][headline]', 'Headline', $h['headline'] );
		self::text_field( 'data[hero][body]', 'Body', $h['body'], true );
		echo '</div>';
	}

	// --- legal ---
	private static function render_legal_fields( array $d ) {
		$pages = [
			'privacy_policy'     => 'Privacy Policy',
			'terms_conditions'   => 'Terms & Conditions',
			'return_policy'      => 'Return Policy',
			'research_use_only'  => 'Research Use Only Policy',
		];
		foreach ( $pages as $slug => $label ) {
			$entry = $d[ $slug ];
			echo '<div class="wrouter-cms-section"><h3>' . esc_html( $label ) . '</h3>';
			echo '<p style="font-size:12px;color:#666;">Rich text/HTML is allowed here (basic tags only - scripts are stripped). Leave blank to keep using the built-in page copy.</p>';
			self::text_field( "data[{$slug}][title]", 'Page title', $entry['title'] );
			echo '<div class="wrouter-cms-field"><label for="data_' . esc_attr( $slug ) . '_body">Body (HTML)</label>';
			echo '<textarea name="data[' . esc_attr( $slug ) . '][body]" rows="14" style="font-family:monospace;font-size:12px;">' . esc_textarea( $entry['body'] ) . '</textarea></div>';
			echo '</div>';
		}
	}

	// --- footer ---
	private static function render_footer_fields( array $d ) {
		echo '<div class="wrouter-cms-section"><h3>Brand & Disclaimer</h3>';
		self::text_field( 'data[brand_body]', 'Brand blurb', $d['brand_body'], true );
		self::text_field( 'data[ruo_disclaimer]', 'RUO disclaimer box text', $d['ruo_disclaimer'], true );
		echo '</div>';

		self::repeater( 'footer_quick_links', 'Quick Links Column', 'data[quick_links]', $d['quick_links'], function ( $base, $row ) {
			self::text_field( $base . '[label]', 'Label', $row['label'] ?? '' );
			self::text_field( $base . '[href]', 'Link', $row['href'] ?? '' );
		} );
		self::repeater( 'footer_compliance_links', 'Compliance & Legal Column', 'data[compliance_links]', $d['compliance_links'], function ( $base, $row ) {
			self::text_field( $base . '[label]', 'Label', $row['label'] ?? '' );
			self::text_field( $base . '[href]', 'Link', $row['href'] ?? '' );
		} );

		$cta = $d['cta'];
		echo '<div class="wrouter-cms-section"><h3>Pre-Footer CTA</h3>';
		self::text_field( 'data[cta][eyebrow]', 'Eyebrow', $cta['eyebrow'] );
		self::text_field( 'data[cta][headline]', 'Headline', $cta['headline'] );
		self::text_field( 'data[cta][body]', 'Body', $cta['body'], true );
		echo '</div>';

		$nl = $d['newsletter'];
		echo '<div class="wrouter-cms-section"><h3>Newsletter Block</h3>';
		self::text_field( 'data[newsletter][title]', 'Title', $nl['title'] );
		self::text_field( 'data[newsletter][body]', 'Body', $nl['body'] );
		echo '</div>';

		self::repeater( 'footer_payment_methods', 'Payment Methods (We Accept)', 'data[payment_methods]', $d['payment_methods'], function ( $base, $row ) {
			self::text_field( $base . '[label]', 'Label', $row['label'] ?? '' );
			self::text_field( $base . '[sub]', 'Sub (account/handle)', $row['sub'] ?? '' );
		} );

		echo '<div class="wrouter-cms-section"><h3>Bottom Bar</h3>';
		self::text_field( 'data[copyright]', 'Copyright line', $d['copyright'] );
		echo '</div>';
	}
}
