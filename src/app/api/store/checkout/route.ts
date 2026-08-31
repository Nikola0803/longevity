import { NextResponse } from "next/server";
import { placeOrder, CheckoutError, type CheckoutInput } from "@/lib/order-engine";

export const runtime = "nodejs";

// POST /api/store/checkout — places a real order directly in the CRM/CMS
// database. This is the whole point of the merge: previously this call
// went out to an external WooCommerce site (see the old lib/woocommerce.ts
// createOrder()); now the order lands in the same Postgres database the
// Orders/Dashboard/Affiliates pages already read from, so it shows up
// there immediately with no sync step.
export async function POST(req: Request) {
  let input: CheckoutInput;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!input?.billing?.email || !input?.items?.length) {
    return NextResponse.json({ error: "Missing required order fields." }, { status: 400 });
  }

  try {
    const order = await placeOrder(input);
    return NextResponse.json({
      id: order.id,
      number: order.externalOrderNumber,
      status: order.status,
      total: (order.grossCents / 100).toFixed(2),
    });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Something went wrong placing your order. Please try again." }, { status: 500 });
  }
}
