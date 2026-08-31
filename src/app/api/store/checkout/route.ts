import { NextResponse } from "next/server";

/**
 * Placeholder checkout endpoint — accepts the order payload and returns a
 * fake confirmation so the checkout flow doesn't 500. Replace with a real
 * WooCommerce order creation call (POST /wp-json/wc/v3/orders) before
 * accepting real payments.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    orderId: `PENDING-${Date.now()}`,
    note: "Checkout is not yet wired to WooCommerce order creation.",
    received: body,
  });
}
