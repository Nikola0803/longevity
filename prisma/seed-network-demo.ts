/**
 * Network demo seed, run AFTER the normal `npm run db:seed`.
 *
 *   npm run db:seed        # creates the Longevity Peptides org + brand + catalog
 *   npm run db:seed:demo   # this file: adds a second branded store on the same catalog
 *
 * It proves Phase 1 end to end with zero code changes between the two stores:
 *
 *   - Backfills the flagship brand's subdomain + customDomain so it resolves
 *     by host (still GLOBAL-priced: it has no BrandProduct rows, so it behaves
 *     exactly as before).
 *   - Adds a second Brand ("Aera Peptides") under the SAME organization, so it
 *     shares the identical master catalog, but with:
 *       * its own subdomain (aera.<root>  /  aera.localhost:3000 in dev)
 *       * its own colour palette (green, vs Longevity Peptides blue)
 *       * its own retail prices via BrandProduct (here: +20% over the master
 *         price, always above the wholesale cogsCents)
 *
 * Idempotent, safe to run repeatedly.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ORG_SLUG = "vertalis";
const FLAGSHIP_BRAND_SLUG = "vertalis";

// Aera's retail markup over the shared master price, for the demo. In the real
// onboarding this comes from Brand.defaultMarkupBps applied to cogsCents.
const AERA_RETAIL_MULTIPLIER = 1.2;

const AERA_THEME = {
  colors: {
    "primary-500": "90 200 160",
    "secondary-500": "70 165 150",
    "accent-200": "205 232 224",
    "accent-300": "150 205 188",
    "bg-800": "9 17 15",
    "bg-900": "6 12 11",
    "bg-100": "18 30 26",
    "bg-200": "26 42 36",
    "bg-300": "36 56 48",
    "fg-100": "228 242 236",
    "signal": "255 118 96",
  },
};

async function main() {
  const org = await prisma.organization.findUnique({ where: { slug: ORG_SLUG } });
  if (!org) throw new Error(`Org "${ORG_SLUG}" not found. Run "npm run db:seed" first.`);

  // 1) Backfill the flagship so it resolves by host too (stays global-priced).
  const flagship = await prisma.brand.findFirst({
    where: { organizationId: org.id, slug: FLAGSHIP_BRAND_SLUG },
  });
  if (flagship) {
    await prisma.brand.update({
      where: { id: flagship.id },
      data: {
        subdomain: flagship.subdomain ?? "vertalis",
        customDomain: flagship.customDomain ?? "longevitypeptides.com",
      },
    });
  }

  // 2) Second brand on the same catalog.
  const aera = await prisma.brand.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: "aera" } },
    update: {
      status: "CONNECTED",
      subdomain: "aera",
      themeTokens: AERA_THEME,
      templateId: "classic",
      defaultMarkupBps: 5000,
    },
    create: {
      organizationId: org.id,
      slug: "aera",
      name: "Aera Peptides",
      domain: "aera.example",
      subdomain: "aera",
      status: "CONNECTED",
      templateId: "classic",
      themeTokens: AERA_THEME,
      plan: "STARTER",
      defaultMarkupBps: 5000,
      lastSyncedAt: new Date(),
    },
  });

  // 3) Aera's own carried catalog + prices. Opting a brand into BrandProduct is
  //    what flips it from global pricing to per-brand pricing.
  const products = await prisma.product.findMany({
    where: { organizationId: org.id, slug: { not: null } },
    select: { id: true, priceCents: true, cogsCents: true, sku: true },
  });

  let created = 0;
  for (const p of products) {
    const base = p.priceCents ?? 0;
    // never let the demo price dip below wholesale + a small floor
    const retail = Math.max(Math.round(base * AERA_RETAIL_MULTIPLIER), p.cogsCents + 500);
    await prisma.brandProduct.upsert({
      where: { brandId_productId: { brandId: aera.id, productId: p.id } },
      update: { retailPriceCents: retail, carried: true },
      create: { brandId: aera.id, productId: p.id, retailPriceCents: retail, carried: true },
    });
    created++;
  }

  console.log(`\n  Network demo ready.`);
  console.log(`  Flagship (global pricing, blue):  http://vertalis.localhost:3000`);
  console.log(`  Reseller (own pricing +20%, green): http://aera.localhost:3000`);
  console.log(`  Aera carries ${created} SKUs from the shared catalog.\n`);
  console.log(`  Dev without subdomains? set DEV_BRAND_SLUG=aera and hit http://localhost:3000\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
