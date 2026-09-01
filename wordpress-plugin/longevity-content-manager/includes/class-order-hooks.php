<?php
/**
 * WooCommerce order-management pieces that don't belong in the CMS or
 * product-tools files: showing which coupon code produced an order's
 * discount on every order email and the My Account order view.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class LPCM_Order_Hooks {

	public static function init() {
		add_filter( 'woocommerce_get_order_item_totals', [ __CLASS__, 'label_discount_with_coupon_codes' ], 10, 3 );
	}

	/**
	 * Show the coupon code on the order's "Discount" line in every
	 * WooCommerce order email (admin new-order notification, customer
	 * processing/completed emails) and the My Account order view - all
	 * three render from this same totals array. Without this it just says
	 * "Discount: -$39.90" with no way to tell which code produced it.
	 */
	public static function label_discount_with_coupon_codes( $total_rows, $order, $tax_display ) {
		if ( isset( $total_rows['discount'] ) ) {
			$codes = $order->get_coupon_codes();
			if ( ! empty( $codes ) ) {
				$total_rows['discount']['label'] = sprintf(
					/* translators: %s: comma-separated coupon code(s) */
					__( 'Discount (%s):', 'longevity-content-manager' ),
					implode( ', ', $codes )
				);
			}
		}
		return $total_rows;
	}
}
