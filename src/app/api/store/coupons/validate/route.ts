import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";

export const runtime = "nodejs";

// POST /api/store/coupons/validate { code, subtotal }
// Replaces the old WooCommerce coupon lookup — coupons are now native
// rows the org manages from the CRM/CMS (Coupon model), not something
// that lived only on the WordPress site.
export async function POST(req: Request) {
  const { code, subtotal } = await req.json().catch(() => ({}));
  if (!code) return NextResponse.json({ valid: false, message: "Enter a coupon code." });

  const { organizationId } = await getStoreContext();
  const coupon = await prisma.coupon.findFirst({
    where: { organizationId, code: { equals: String(code).trim(), mode: "insensitive" } },
  });

  if (!coupon || !coupon.active) {
    return NextResponse.json({ valid: false, message: "Coupon code not found." });
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, message: "This coupon has expired." });
  }
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    return NextResponse.json({ valid: false, message: "This coupon has reached its usage limit." });
  }
  const sub = Number(subtotal) || 0;
  const minDollars = (coupon.minSubtotalCents ?? 0) / 100;
  if (minDollars > 0 && sub < minDollars) {
    return NextResponse.json({ valid: false, message: `Minimum order of $${minDollars.toFixed(2)} required for this coupon.` });
  }

  let discountAmount =
    coupon.discountType === "PERCENT" ? (sub * coupon.amount) / 100 : Math.min(coupon.amount, sub);
  if (coupon.maxDiscountCents) discountAmount = Math.min(discountAmount, coupon.maxDiscountCents / 100);
  discountAmount = Math.round(discountAmount * 100) / 100;

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discountAmount,
    freeShipping: coupon.freeShipping,
    discountedTotal: Math.max(0, sub - discountAmount),
  });
}
