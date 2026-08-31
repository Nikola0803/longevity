import "server-only";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";
import { DEFAULT_SHIPPING_RATES, priceShippingMethod, type ShippingMethod } from "@/lib/shipping";

const MERCHANT_FEE_PERCENT = 0; // manual Zelle/CashApp/Venmo — no processor cut
const MERCHANT_FEE_FIXED_CENTS = 0;

export interface CheckoutLineItem {
  slug: string;
  quantity: number;
}

export interface CheckoutInput {
  items: CheckoutLineItem[];
  paymentMethod: "zelle" | "cashapp" | "venmo";
  paymentMemo: string;
  customerNote?: string;
  couponCode?: string;
  affiliateRef?: string;
  customerId?: string;
  shippingMethod?: ShippingMethod;
  billing: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    city: string;
    state: string;
    zip: string;
    country?: "US" | "CA" | "GB";
  };
}

export class CheckoutError extends Error {}

/**
 * Places an order directly against the CRM/CMS's own database — this is
 * what used to be a WooCommerce REST call. Runs in one transaction so
 * stock, coupon usage, and affiliate commission can never end up
 * half-applied.
 */
export async function placeOrder(input: CheckoutInput) {
  const { organizationId, brandId } = await getStoreContext();

  if (!input.items.length) throw new CheckoutError("Your cart is empty.");

  const shipCountry = input.billing.country ?? "US";
  if (!["US", "CA", "GB"].includes(shipCountry)) {
    throw new CheckoutError("We currently only ship to the United States, Canada, and the United Kingdom.");
  }

  return prisma.$transaction(async (tx) => {
    const email = input.billing.email.toLowerCase().trim();

    // Resolve products + lock in price/stock at order time.
    const resolvedItems: {
      productId?: string;
      sku: string;
      name: string;
      quantity: number;
      unitPriceCents: number;
    }[] = [];
    let subtotalCents = 0;
    let cogsCentsTotal = 0;

    for (const line of input.items) {
      const product = await tx.product.findFirst({
        where: { organizationId, slug: line.slug },
      });
      if (!product) {
        throw new CheckoutError(`A product in your cart is no longer available (${line.slug}).`);
      }
      if (product.hidden) {
        throw new CheckoutError(`"${product.name}" is no longer available.`);
      }
      const unitPriceCents = product.priceCents ?? 0;
      subtotalCents += unitPriceCents * line.quantity;
      cogsCentsTotal += product.cogsCents * line.quantity;
      resolvedItems.push({
        productId: product.id,
        sku: product.sku,
        name: product.name ?? product.sku,
        quantity: line.quantity,
        unitPriceCents,
      });
      await tx.product.update({
        where: { id: product.id },
        data: { masterStock: { decrement: line.quantity } },
      });
    }

    // Coupon.
    let discountCents = 0;
    let couponCode: string | undefined;
    if (input.couponCode) {
      const coupon = await tx.coupon.findFirst({
        where: { organizationId, code: { equals: input.couponCode.trim(), mode: "insensitive" }, active: true },
      });
      if (coupon) {
        const notExpired = !coupon.expiresAt || coupon.expiresAt > new Date();
        const underLimit = coupon.usageLimit == null || coupon.usageCount < coupon.usageLimit;
        const meetsMin = !coupon.minSubtotalCents || subtotalCents >= coupon.minSubtotalCents;
        if (notExpired && underLimit && meetsMin) {
          discountCents =
            coupon.discountType === "PERCENT"
              ? Math.round((subtotalCents * coupon.amount) / 100)
              : Math.round(coupon.amount * 100);
          if (coupon.maxDiscountCents) discountCents = Math.min(discountCents, coupon.maxDiscountCents);
          discountCents = Math.min(discountCents, subtotalCents);
          couponCode = coupon.code;
          await tx.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } });
        }
      }
    }

    // Shipping — priced server-side from this brand's own ShippingConfig,
    // never from whatever the client claims it should cost.
    const shippingConfig = await tx.shippingConfig.findUnique({ where: { brandId } });
    const rates = shippingConfig ?? DEFAULT_SHIPPING_RATES;
    const shippingMethod: ShippingMethod = shipCountry === "US" ? input.shippingMethod ?? "standard" : "international";
    const shippingCents = priceShippingMethod(shippingMethod, subtotalCents, rates, shipCountry);

    const grossCents = subtotalCents - discountCents + shippingCents;

    // Affiliate attribution — matches by coupon code first (existing
    // convention from the webhook ingestion path), falling back to the
    // ?ref= cookie code captured at click-time.
    let affiliateId: string | undefined;
    let commissionCents = 0;
    const refCandidates = [couponCode, input.affiliateRef].filter(Boolean) as string[];
    for (const candidate of refCandidates) {
      const affiliate = await tx.affiliate.findFirst({
        where: { organizationId, OR: [{ couponCode: { equals: candidate, mode: "insensitive" } }, { slug: { equals: candidate, mode: "insensitive" } }] },
      });
      if (affiliate) {
        affiliateId = affiliate.id;
        commissionCents = Math.round((grossCents * affiliate.ratePercent) / 100);
        break;
      }
    }

    const merchantFeeCents = Math.round((grossCents * MERCHANT_FEE_PERCENT) / 100) + MERCHANT_FEE_FIXED_CENTS;
    const netProfitCents = grossCents - cogsCentsTotal - merchantFeeCents - commissionCents;

    // Contact (unified customer identity, same table the webhook path uses).
    const contact = await tx.contact.upsert({
      where: { organizationId_email: { organizationId, email } },
      update: {},
      create: { organizationId, email },
    });
    await tx.contactBrandLink.upsert({
      where: { contactId_brandId: { contactId: contact.id, brandId } },
      update: {},
      create: { contactId: contact.id, brandId, externalCustomerId: input.customerId },
    });

    const externalOrderNumber = `VTL-${Date.now().toString(36).toUpperCase()}`;

    const order = await tx.order.create({
      data: {
        organizationId,
        brandId,
        contactId: contact.id,
        externalOrderNumber,
        status: "PENDING",
        couponCode,
        grossCents,
        netProfitCents,
        placedAt: new Date(),
        customerName: `${input.billing.firstName} ${input.billing.lastName}`.trim(),
        customerEmail: email,
        customerPhone: input.billing.phone,
        shippingAddress: {
          address1: input.billing.address1,
          city: input.billing.city,
          state: input.billing.state,
          zip: input.billing.zip,
          country: input.billing.country ?? "US",
        },
        paymentMethod: input.paymentMethod,
        paymentMemo: input.paymentMemo,
        customerNote: input.customerNote,
        shippingMethod,
        shippingCents,
        items: { createMany: { data: resolvedItems } },
      },
      include: { items: true },
    });

    if (affiliateId) {
      await tx.affiliateOrderAttribution.upsert({
        where: { orderId: order.id },
        update: { commissionCents, affiliateId },
        create: { orderId: order.id, affiliateId, commissionCents },
      });
    }

    await tx.brand.update({ where: { id: brandId }, data: { lastSyncedAt: new Date() } });

    return order;
  });
}
