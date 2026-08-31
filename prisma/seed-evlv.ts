import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Rough placeholder COGS assumption (35% of retail) until real per-SKU
// cost data is entered in the CRM — same convention as prisma/seed.ts.
const ASSUMED_COGS_RATIO = 0.35;

// Staff login for the new EVLV organization. Change this password after
// first login (Settings, once account management is added there).
const STAFF_EMAIL = "operator@evlvpeptides.com";
const STAFF_PASSWORD = "password123";

// Mirrors the 13 real SKUs in evlv-site/src/lib/products.ts exactly — slug
// and sku here MUST match evlv-site's data 1:1, since the checkout API
// resolves cart line items by slug (see lib/order-engine.ts placeOrder()).
// memberOnly is not a CRM concept yet (that gating stays client-side in
// evlv-site for now), so it's not carried over here.
const EVLV_PRODUCTS = [
  { slug: "bpc-157-10mg", sku: "BPC-10", name: "BPC-157 10MG", category: "peptides", spec: "10 mg / vial", purity: "98.51%", price: 70, description: "BPC-157 10mg, lyophilized and independently verified for identity and purity. Supplied for laboratory research use only." },
  { slug: "gp-3-10mg", sku: "GP3-10", name: "GP-3 10MG", category: "peptides", spec: "10 mg / vial", purity: "99.69%", price: 90, description: "GP-3 10mg vial for research protocols. 99.69% purity verified by independent third-party testing." },
  { slug: "tesamorelin-10mg", sku: "TESA-10", name: "TESAMORELIN 10MG", category: "peptides", spec: "10 mg / vial", purity: "99.86%", price: 90, description: "Tesamorelin 10mg vial for research protocols. 99.86% purity verified by independent third-party testing." },
  { slug: "ghk-cu-50mg", sku: "GHK-50", name: "GHK-CU 50MG", category: "ancillaries", spec: "50 mg / vial", purity: "99.4%", price: 65, description: "GHK-Cu 50mg vial for research protocols. 99.4% purity verified by independent third-party testing." },
  { slug: "mots-c-10mg", sku: "MOTS-10", name: "MOTS-C 10MG", category: "ancillaries", spec: "10 mg / vial", purity: "99.5%", price: 75, description: "MOTS-c 10mg vial for research protocols. 99.5% purity verified by independent third-party testing." },
  { slug: "5-amino-1mq-50mg", sku: "5AM1MQ-50", name: "5-AMINO-1MQ 50MG", category: "ancillaries", spec: "50 mg / vial", purity: "99.3%", price: 70, description: "5-Amino-1MQ 50mg vial for research protocols. 99.3% purity verified by independent third-party testing." },
  { slug: "thymosin-alpha-1-5mg", sku: "TA1-5", name: "THYMOSIN ALPHA-1 5MG", category: "peptides", spec: "5 mg / vial", purity: "99.5%", price: 60, description: "Thymosin Alpha-1 5mg vial for research protocols. 99.5% purity verified by independent third-party testing." },
  { slug: "wolverine-stack-20mg", sku: "WOLV-20", name: "WOLVERINE STACK 20MG", category: "peptides", spec: "20 mg / vial", purity: "", price: 95, description: "Wolverine Stack 20mg blend for research protocols, independently tested for identity and mass." },
  { slug: "glow-70mg", sku: "GLOW-70", name: "GLOW 70MG", category: "peptides", spec: "70 mg / vial", purity: "", price: 110, description: "GLOW 70mg blend for research protocols, independently tested for identity and mass." },
  { slug: "sermorelin-10mg", sku: "SERM-10", name: "SERMORELIN 10MG", category: "peptides", spec: "10 mg / vial", purity: "99.4%", price: 65, description: "Sermorelin 10mg vial for research protocols. 99.4% purity verified by independent third-party testing." },
  { slug: "klow-80mg", sku: "KLOW-80", name: "KLOW 80MG", category: "peptides", spec: "80 mg / vial", purity: "", price: 125, description: "KLOW 80mg blend for research protocols, independently tested for identity and mass." },
  { slug: "selank-10mg", sku: "SEL-10", name: "SELANK 10MG", category: "peptides", spec: "10 mg / vial", purity: "99.4%", price: 60, description: "Selank 10mg vial for research protocols. 99.4% purity verified by independent third-party testing." },
  { slug: "cjc-1295-no-dac-5mg", sku: "CJC-5", name: "CJC-1295 WITHOUT DAC 5MG", category: "peptides", spec: "5 mg / vial", purity: "99.6%", price: 70, description: "CJC-1295 without DAC 5mg vial for research protocols. 99.6% purity verified by independent third-party testing." },
  // Required reconstitution add-on, auto-included in every EVLV cart (see cart-context.tsx BAC_WATER) — seeded
  // as a real product so it resolves at real checkout instead of failing as an unknown slug.
  { slug: "bacteriostatic-water-30ml", sku: "BAC-30", name: "Bacteriostatic Water 30mL", category: "ancillaries", spec: "30 mL / vial", purity: "", price: 15, description: "Bacteriostatic water for reconstitution, required for lyophilized research compounds." },
];

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "evlv" },
    update: {},
    create: { name: "EVLV", slug: "evlv", plan: "GROWTH" },
  });

  const passwordHash = await bcrypt.hash(STAFF_PASSWORD, 10);
  const staffUser = await prisma.user.upsert({
    where: { email: STAFF_EMAIL },
    update: {},
    create: { email: STAFF_EMAIL, name: "EVLV Operator", passwordHash },
  });
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: staffUser.id, organizationId: org.id } },
    update: {},
    create: { userId: staffUser.id, organizationId: org.id, role: "OWNER" },
  });

  // First-party brand — evlv-site is a direct-checkout storefront (no
  // WooCommerce), matching how prisma/seed.ts sets up Vertalis.
  const brand = await prisma.brand.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: "evlv" } },
    update: { status: "CONNECTED" },
    create: {
      organizationId: org.id,
      slug: "evlv",
      name: "EVLV",
      domain: "evlvpeptides.com",
      status: "CONNECTED",
      lastSyncedAt: new Date(),
    },
  });

  for (const p of EVLV_PRODUCTS) {
    const priceCents = Math.round(p.price * 100);
    const product = await prisma.product.upsert({
      where: { organizationId_sku: { organizationId: org.id, sku: p.sku } },
      update: {},
      create: {
        organizationId: org.id,
        sku: p.sku,
        slug: p.slug,
        chemicalName: p.name,
        name: p.name,
        category: p.category,
        spec: p.spec,
        purity: p.purity || null,
        description: p.description,
        shortDescription: p.description,
        images: ["/images/products/vial-placeholder.png"],
        priceCents,
        cogsCents: Math.round(priceCents * ASSUMED_COGS_RATIO),
        masterStock: 250,
        inStock: true,
        hidden: false,
      },
    });
    await prisma.storeMapping.upsert({
      where: { brandId_externalProductId: { brandId: brand.id, externalProductId: p.slug } },
      update: {},
      create: { productId: product.id, brandId: brand.id, externalProductId: p.slug },
    });
  }

  console.log(`\nEVLV organization ready.`);
  console.log(`  Organization API key (CRM_ORG_API_KEY): ${org.apiKey}`);
  console.log(`  Brand domain (CRM_STORE_DOMAIN):         ${brand.domain}`);
  console.log(`  Staff login: ${STAFF_EMAIL} / ${STAFF_PASSWORD} (change after first login)`);
  console.log(`  Seeded ${EVLV_PRODUCTS.length} products.\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
