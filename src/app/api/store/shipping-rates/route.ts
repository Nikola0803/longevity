import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";
import { DEFAULT_SHIPPING_RATES } from "@/lib/shipping";

export const dynamic = "force-dynamic";

// GET /api/store/shipping-rates — read-only, lets the checkout page price
// shipping options live. The actual charge is always recomputed server-side
// in placeOrder() too, so nothing here is trusted blindly at order time.
export async function GET() {
  try {
    const { brandId } = await getStoreContext();
    const config = await prisma.shippingConfig.findUnique({ where: { brandId } });
    return NextResponse.json(
      config
        ? {
            freeThresholdCents: config.freeThresholdCents,
            standardCents: config.standardCents,
            expeditedCents: config.expeditedCents,
            overnightCents: config.overnightCents,
          }
        : DEFAULT_SHIPPING_RATES
    );
  } catch {
    return NextResponse.json(DEFAULT_SHIPPING_RATES);
  }
}
