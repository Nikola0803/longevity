import type { MetadataRoute } from "next";
import { getAllCatalogProducts } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";

const SITE_URL = "https://vertalispeptides.com";

const CATEGORY_SLUGS = [
  "peptides",
  "fat-loss-metabolic",
  "recovery-repair",
  "longevity",
  "cognitive",
  "peptide-blends",
  "research-supplies",
];

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/quality", changeFrequency: "monthly", priority: 0.7 },
  { path: "/coa", changeFrequency: "weekly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.4 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.6 },
  { path: "/veterans", changeFrequency: "monthly", priority: 0.4 },
  { path: "/affiliate", changeFrequency: "monthly", priority: 0.4 },
  { path: "/quiz", changeFrequency: "monthly", priority: 0.3 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.1 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.1 },
  { path: "/legal/research-use", changeFrequency: "yearly", priority: 0.1 },
  { path: "/legal/shipping-returns", changeFrequency: "yearly", priority: 0.1 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/shop/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const products = await getAllCatalogProducts();
  const productEntries: MetadataRoute.Sitemap = products
    .filter((p) => !p.hidden)
    .map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const { organizationId } = await getStoreContext();
    const posts = await prisma.page.findMany({
      where: { organizationId, type: "BLOG_POST", published: true },
      select: { slug: true, updatedAt: true },
    });
    blogEntries = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    }));
  } catch {
    // CMS not seeded yet — sitemap still works without blog entries.
  }

  return [...staticEntries, ...categoryEntries, ...productEntries, ...blogEntries];
}
