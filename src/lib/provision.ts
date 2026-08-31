import "server-only";
import { prisma } from "@/lib/prisma";
import { checkSubdomainAvailable } from "@/lib/subdomain";
import { storeUrl } from "@/lib/store-url";

/**
 * Turns an onboarding submission into a live store.
 *
 * A brand is created under the platform organization (the one that owns the
 * shared master catalog), its carried catalog is seeded from that catalog at
 * the reseller's markup, and default tracking/shipping config rows are created
 * so the store works out of the box. The store is live immediately at its
 * subdomain (and at the custom domain too, once that domain's DNS points here).
 *
 * NOTE: this endpoint is intentionally open for now so you can test the flow.
 * Before selling, gate it behind a real signup + payment step, and create the
 * reseller's STORE_OPERATOR login here (Phase 4, once that scoped role exists).
 */

const PLATFORM_ORG_SLUG = process.env.PLATFORM_ORG_SLUG ?? "vertalis";

// Same allow-list the theme layer honours (see brand-theme.ts). Kept here so a
// provisioning payload can't inject anything else.
function themeFromPrimary(primaryRgb?: string | null): { colors: Record<string, string> } | undefined {
  const triplet = sanitizeTriplet(primaryRgb);
  if (!triplet) return undefined;
  const [r, g, b] = triplet.split(" ").map(Number);
  // secondary = the same hue, ~18% darker, so buttons/glows read as one palette
  const darker = [r, g, b].map((n) => Math.round(n * 0.82)).join(" ");
  return { colors: { "primary-500": triplet, "secondary-500": darker } };
}

function sanitizeTriplet(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const parts = raw.trim().split(/[\s,]+/).map((n) => Number(n));
  if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return parts.join(" ");
}

export type ProvisionInput = {
  name: string;
  subdomain: string;
  customDomain?: string | null;
  templateId?: string;
  primaryColorRgb?: string | null; // "R G B"
};

export type ProvisionResult =
  | { ok: true; brandId: string; url: string; subdomain: string }
  | { ok: false; error: string };

const DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/i;

export async function provisionBrand(input: ProvisionInput): Promise<ProvisionResult> {
  const name = (input.name ?? "").trim();
  const subdomain = (input.subdomain ?? "").toLowerCase().trim();
  const customDomain = input.customDomain?.toLowerCase().trim() || null;

  if (!name) return { ok: false, error: "Store name is required." };

  const subCheck = await checkSubdomainAvailable(subdomain);
  if (!subCheck.ok) return { ok: false, error: subCheck.reason ?? "Invalid store address." };

  if (customDomain) {
    if (!DOMAIN_RE.test(customDomain)) return { ok: false, error: "That custom domain doesn't look valid." };
    const taken = await prisma.brand.findUnique({ where: { customDomain }, select: { id: true } });
    if (taken) return { ok: false, error: "That custom domain is already connected to another store." };
  }

  const org = await prisma.organization.findUnique({ where: { slug: PLATFORM_ORG_SLUG }, select: { id: true } });
  if (!org) return { ok: false, error: `Platform organization "${PLATFORM_ORG_SLUG}" not found. Run "npm run db:seed".` };

  // brand slug is unique per org; base it on the subdomain, dedupe if needed.
  let brandSlug = subdomain;
  for (let i = 2; i <= 50; i++) {
    const clash = await prisma.brand.findFirst({
      where: { organizationId: org.id, slug: brandSlug },
      select: { id: true },
    });
    if (!clash) break;
    brandSlug = `${subdomain}-${i}`;
  }

  const themeTokens = themeFromPrimary(input.primaryColorRgb);
  const templateId = input.templateId?.trim() || "classic";

  try {
    const result = await prisma.$transaction(async (tx) => {
      const brand = await tx.brand.create({
        data: {
          organizationId: org.id,
          name,
          slug: brandSlug,
          domain: customDomain ?? `${subdomain}.store`,
          subdomain,
          customDomain,
          templateId,
          themeTokens: themeTokens ?? undefined,
          status: "CONNECTED",
          plan: "TRIAL",
          lastSyncedAt: new Date(),
        },
      });

      // Seed the carried catalog at this brand's default markup over wholesale.
      const products = await tx.product.findMany({
        where: { organizationId: org.id, slug: { not: null } },
        select: { id: true, cogsCents: true, priceCents: true },
      });
      const markup = brand.defaultMarkupBps / 10000; // e.g. 4000 bps -> 0.40
      if (products.length) {
        await tx.brandProduct.createMany({
          data: products.map((p) => {
            const wholesale = p.cogsCents;
            const retail = Math.max(Math.round(wholesale * (1 + markup)), wholesale + 500);
            return { brandId: brand.id, productId: p.id, retailPriceCents: retail, carried: true };
          }),
          skipDuplicates: true,
        });
      }

      // Default tracking + shipping config so the store works immediately.
      await tx.trackingConfig.create({ data: { brandId: brand.id } });
      await tx.shippingConfig.create({ data: { brandId: brand.id } });

      return brand;
    });

    return {
      ok: true,
      brandId: result.id,
      subdomain,
      url: storeUrl({ subdomain: result.subdomain, customDomain: result.customDomain }),
    };
  } catch {
    // Unique-constraint race on subdomain/customDomain between check and insert.
    return { ok: false, error: "Could not create the store (that address may have just been taken). Try again." };
  }
}
