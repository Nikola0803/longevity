import { NextResponse } from "next/server";
import { DEFAULT_SHIPPING_RATES } from "@/lib/shipping";

// GET /api/store/shipping-rates — read-only, lets the checkout page price
// shipping options live. Static defaults for now; wire to a WooCommerce
// shipping-zones read if you need store-configured rates.
export async function GET() {
  return NextResponse.json(DEFAULT_SHIPPING_RATES);
}
