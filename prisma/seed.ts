import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PRODUCTS } from "../src/data/products";

const prisma = new PrismaClient();

// Rough placeholder COGS assumption (35% of retail) until real per-SKU
// cost data is entered in the CRM — good enough for the net-profit column
// to show something sane out of the box; edit per-product in /admin/products.
const ASSUMED_COGS_RATIO = 0.35;

// Staff login created for the Vertalis organization. Change this password
// after first login (Settings, once account management is added there).
const STAFF_EMAIL = "operator@vertalispeptides.com";
const STAFF_PASSWORD = "password123";

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "vertalis" },
    update: {},
    create: { name: "Vertalis Peptides", slug: "vertalis", plan: "GROWTH" },
  });

  const passwordHash = await bcrypt.hash(STAFF_PASSWORD, 10);
  const staffUser = await prisma.user.upsert({
    where: { email: STAFF_EMAIL },
    update: {},
    create: { email: STAFF_EMAIL, name: "Vertalis Operator", passwordHash },
  });
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: staffUser.id, organizationId: org.id } },
    update: {},
    create: { userId: staffUser.id, organizationId: org.id, role: "OWNER" },
  });

  // Single first-party "brand" representing the storefront itself — no
  // WooCommerce keys, since the CRM/CMS *is* the storefront's backend now.
  // Adding a second site later (another Brand under this same Organization)
  // is a CRM Settings action, not a code change — see /admin/settings.
  const brand = await prisma.brand.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: "vertalis" } },
    update: { status: "CONNECTED" },
    create: {
      organizationId: org.id,
      slug: "vertalis",
      name: "Vertalis Peptides",
      domain: "vertalispeptides.com",
      status: "CONNECTED",
      lastSyncedAt: new Date(),
    },
  });

  // Catalog: seeded once from the storefront's original data/products.ts so
  // the numbers match what shipped, but /admin/products is now the source
  // of truth going forward — this upsert will never overwrite an edit you
  // make there, because it only fills in fields the first time a SKU is
  // created (see the `update: {}` below).
  for (const p of PRODUCTS) {
    const priceCents = Math.round(p.price * 100);
    const product = await prisma.product.upsert({
      where: { organizationId_sku: { organizationId: org.id, sku: p.slug } },
      update: {},
      create: {
        organizationId: org.id,
        sku: p.slug,
        slug: p.slug,
        chemicalName: p.name,
        name: p.name,
        category: p.category,
        spec: p.spec,
        purity: p.purity,
        description: p.description,
        shortDescription: p.description,
        images: [p.image],
        priceCents,
        cogsCents: Math.round(priceCents * ASSUMED_COGS_RATIO),
        masterStock: p.disabled ? 0 : 250,
        inStock: !p.disabled,
        hidden: Boolean(p.hidden),
      },
    });
    await prisma.storeMapping.upsert({
      where: { brandId_externalProductId: { brandId: brand.id, externalProductId: p.slug } },
      update: {},
      create: { productId: product.id, brandId: brand.id, externalProductId: p.slug },
    });
  }

  // Live coupons matching the ones referenced in the checkout page's
  // placeholder copy ("Try VERTALIS10, LABVIP, or WELCOME5").
  const coupons: { code: string; discountType: "PERCENT" | "FIXED"; amount: number }[] = [
    { code: "VERTALIS10", discountType: "PERCENT", amount: 10 },
    { code: "WELCOME5", discountType: "FIXED", amount: 5 },
  ];
  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { organizationId_code: { organizationId: org.id, code: c.code } },
      update: {},
      create: { organizationId: org.id, code: c.code, discountType: c.discountType, amount: c.amount },
    });
  }

  // Starter blog content — the CMS's Content section (/admin/content) is
  // the source going forward; these seed the same posts that used to be
  // hardcoded in app/blog/page.tsx so the blog isn't empty on first run.
  const posts: { slug: string; title: string; excerpt: string; body: string; publishedAt: Date }[] = [
    {
      slug: "how-to-read-a-certificate-of-analysis",
      title: "How to actually read a Certificate of Analysis",
      excerpt:
        "Purity percentage is one line on the page. Here's what the HPLC chromatogram, retention time, and mass spec confirmation are actually telling you, and why we publish every one.",
      body: "Purity percentage is one line on the page. Here's what the HPLC chromatogram, retention time, and mass spec confirmation are actually telling you, and why we publish every one.",
      publishedAt: new Date("2026-07-02"),
    },
    {
      slug: "lyophilized-vs-cold-chain-shelf-stability",
      title: "Lyophilized vs. cold-chain: what shelf-stability really means",
      excerpt:
        "Freeze-dried peptides ship ambient and store in a standard freezer, no cold-chain courier required. We break down the chemistry behind why lyophilization holds up.",
      body: "Freeze-dried peptides ship ambient and store in a standard freezer, no cold-chain courier required. We break down the chemistry behind why lyophilization holds up, and how to store a vial once it arrives.",
      publishedAt: new Date("2026-06-24"),
    },
    {
      slug: "glp1-dual-agonist-research-2026",
      title: "GLP-1 and dual-agonist research: a 2026 landscape",
      excerpt:
        "A plain-language overview of where GLP-1, GIP, and glucagon receptor research stands today, and the compounds researchers are requesting most.",
      body: "A plain-language overview of where GLP-1, GIP, and glucagon receptor research stands today, and the compounds researchers are requesting most.",
      publishedAt: new Date("2026-06-11"),
    },
    {
      slug: "reconstitution-basics-bacteriostatic-water",
      title: "Reconstitution basics: bacteriostatic water, dosing math, and common mistakes",
      excerpt:
        "A practical walkthrough of reconstituting lyophilized powder for research use, including the concentration math researchers ask us about most often.",
      body: "A practical walkthrough of reconstituting lyophilized powder for research use, including the concentration math researchers ask us about most often.",
      publishedAt: new Date("2026-05-28"),
    },
    {
      slug: "why-we-publish-every-coa",
      title: "Why we publish every COA, even the ones that don't look perfect",
      excerpt:
        "Public archives mean a batch that misses threshold shows up too. Here's why we think that's the only version of \"verified\" worth trusting.",
      body: "Public archives mean a batch that misses threshold shows up too. Here's why we think that's the only version of \"verified\" worth trusting.",
      publishedAt: new Date("2026-05-14"),
    },
    {
      slug: "bpc-157-tb-500-tissue-repair-literature",
      title: "BPC-157 and TB-500 in tissue-repair research: current literature",
      excerpt:
        "A survey of published research on these two of the most-requested recovery-focused peptides, and what questions the literature still leaves open.",
      body: "A survey of published research on these two of the most-requested recovery-focused peptides, and what questions the literature still leaves open.",
      publishedAt: new Date("2026-04-30"),
    },
  ];

  for (const post of posts) {
    await prisma.page.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: post.slug } },
      update: {},
      create: {
        organizationId: org.id,
        type: "BLOG_POST",
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        published: true,
        publishedAt: post.publishedAt,
      },
    });
  }

  console.log(`Seeded Vertalis: ${PRODUCTS.length} products, ${posts.length} blog posts, brand "${brand.slug}".`);
  console.log(`Sign in at /admin/login with ${STAFF_EMAIL} / ${STAFF_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
