import { NextResponse } from "next/server";
import { wooHeadlessCheckout, type WooCheckoutItem, type WooBillingAddress } from "@/lib/woo-store-api";

export const runtime = "nodejs";

interface RequestBody {
  items: Array<{ wooProductId?: number; wooVariationId?: number; qty: number }>;
  billing: WooBillingAddress;
  customerNote?: string;
}

// POST /api/store/woo-checkout — the real checkout endpoint. Runs the
// actual WooCommerce checkout pipeline (via the Store API) with the
// NiftiPay gateway selected, and returns the URL to redirect the browser
// to next (NiftiPay's hosted payUrl). Requires WOO_STORE_URL to be
// configured — there is no fallback here, unlike catalog reads: you can't
// "fall back" a real payment.
export async function POST(req: Request) {
  if (!process.env.WOO_STORE_URL) {
    return NextResponse.json(
      { error: "Checkout isn't connected to WooCommerce yet (WOO_STORE_URL not configured)." },
      { status: 503 },
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body?.items?.length || !body?.billing?.email) {
    return NextResponse.json({ error: "Missing cart items or billing details." }, { status: 400 });
  }

  const items: WooCheckoutItem[] = body.items.map((i) => ({
    wooProductId: i.wooProductId ?? 0,
    wooVariationId: i.wooVariationId,
    qty: i.qty,
  }));

  const result = await wooHeadlessCheckout(items, body.billing, body.customerNote);

  if (!result.ok) {
    return NextResponse.json({ error: result.error, details: result.details }, { status: 502 });
  }

  return NextResponse.json({ redirectUrl: result.redirectUrl, orderId: result.orderId });
}
