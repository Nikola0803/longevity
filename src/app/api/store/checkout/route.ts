import { NextResponse } from "next/server";

/**
 * Placeholder checkout endpoint — accepts the order payload and returns a
 * fake confirmation so the checkout flow doesn't error. Replace with a real
 * WooCommerce order creation call (POST /wp-json/wc/v3/orders, using the
 * same WOO_* env vars as src/lib/storefront-catalog.ts) before accepting
 * real payments.
 */
export async function POST(req: Request) {
  let input: { billing?: { email?: string }; items?: unknown[] };
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!input?.billing?.email || !input?.items?.length) {
    return NextResponse.json({ error: "Missing required order fields." }, { status: 400 });
  }

  return NextResponse.json({
    id: `PENDING-${Date.now()}`,
    number: `PENDING-${Date.now()}`,
    status: "pending",
    total: "0.00",
    note: "Checkout is not yet wired to WooCommerce order creation.",
  });
}
