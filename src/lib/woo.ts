import "server-only";
import type { Product } from "./product-types";
import { FALLBACK_PRODUCTS } from "@/data/products";

/**
 * Standard WooCommerce REST API v3 client — your store's own consumer
 * key/secret (longevity-peps' Woo integration only worked through
 * Lovable.dev's private connector gateway, which isn't usable here).
 * Configure via env:
 *   WOO_STORE_URL=https://yourstore.com
 *   WOO_CONSUMER_KEY=ck_...
 *   WOO_CONSUMER_SECRET=cs_...
 * Unset, or a failed request, falls back to FALLBACK_PRODUCTS
 * (src/data/products.ts) so the shop is never empty.
 */

interface WooImage {
  src: string;
  alt: string;
}
interface WooVariation {
  id: number;
  price: string;
  regular_price: string;
  sku: string;
  stock_status: string;
  attributes: Array<{ name: string; option: string }>;
}
interface WooProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  stock_status: string;
  sku: string;
  categories: Array<{ name: string }>;
  images: WooImage[];
  variations?: number[];
}

const CATALOG_TTL_MS = 60_000;
let cache: { at: number; products: Product[] } | null = null;

function wooConfigured() {
  return !!(process.env.WOO_STORE_URL && process.env.WOO_CONSUMER_KEY && process.env.WOO_CONSUMER_SECRET);
}

async function wooFetch<T>(path: string): Promise<T> {
  const base = process.env.WOO_STORE_URL!.replace(/\/$/, "");
  const url = new URL(`${base}/wp-json/wc/v3${path}`);
  url.searchParams.set("consumer_key", process.env.WOO_CONSUMER_KEY!);
  url.searchParams.set("consumer_secret", process.env.WOO_CONSUMER_SECRET!);
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`WooCommerce ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const IN_STOCK = "text-secondary-500 shadow-[0_0_5px_1px_currentColor]";
const OUT_OF_STOCK = "text-signal shadow-[0_0_5px_1px_currentColor]";

/** Splits a variable product's variations into dose entries (one Product per
 * dose/spec, matching the site's existing "spec variant" model — pack-count
 * (1x/10x) rides along as a Woo attribute matched by /pack|qty|quantity/i,
 * folded into the price via the selected variation directly). */
function adaptWooProduct(p: WooProduct, variations: WooVariation[]): Product[] {
  const category = p.categories[0]?.name ?? "Peptides";
  const description = stripHtml(p.description || p.short_description || "");
  const images = p.images.map((i) => i.src);
  const image = images[0] ?? "/images/placeholder.png";

  if (variations.length === 0) {
    const price = parseFloat(p.price || p.regular_price || "0");
    const inStock = p.stock_status === "instock";
    return [
      {
        slug: p.slug,
        name: p.name,
        spec: "",
        price,
        image,
        images,
        imgAlt: `${p.name} research peptide vial`,
        imgTitle: p.name,
        category,
        purity: "",
        description,
        sku: p.sku,
        statusDot: inStock ? IN_STOCK : OUT_OF_STOCK,
        statusLabel: inStock ? "In Stock" : "Backordered",
        disabled: !inStock,
        buttonText: inStock ? "Add to Cart" : "Unavailable",
      },
    ];
  }

  return variations.map((v) => {
    const spec =
      v.attributes.find((a) => /dose|size|spec|pack|qty|quantity/i.test(a.name))?.option ??
      v.attributes.map((a) => a.option).join(" / ");
    const price = parseFloat(v.price || v.regular_price || "0");
    const inStock = v.stock_status === "instock";
    const slugSuffix = spec ? `-${spec.toLowerCase().replace(/\s+/g, "")}` : "";
    return {
      slug: `${p.slug}${slugSuffix}`,
      name: p.name,
      spec,
      price,
      image,
      images,
      imgAlt: `${p.name} ${spec} research peptide vial`.trim(),
      imgTitle: `${p.name} · ${spec}`.trim(),
      category,
      purity: "",
      description,
      sku: v.sku || p.sku,
      statusDot: inStock ? IN_STOCK : OUT_OF_STOCK,
      statusLabel: inStock ? "In Stock" : "Backordered",
      disabled: !inStock,
      buttonText: inStock ? "Add to Cart" : "Unavailable",
    };
  });
}

export async function getAllCatalogProducts(): Promise<Product[]> {
  if (!wooConfigured()) return FALLBACK_PRODUCTS;
  if (cache && Date.now() - cache.at < CATALOG_TTL_MS) return cache.products;

  try {
    const items = await wooFetch<WooProduct[]>("/products?per_page=100&status=publish");
    const withVariations = await Promise.all(
      items.map(async (p) => {
        if (p.type === "variable" && p.variations && p.variations.length > 0) {
          try {
            const vars = await wooFetch<WooVariation[]>(`/products/${p.id}/variations?per_page=50`);
            return adaptWooProduct(p, vars);
          } catch {
            return adaptWooProduct(p, []);
          }
        }
        return adaptWooProduct(p, []);
      }),
    );
    const products = withVariations.flat();
    cache = { at: Date.now(), products };
    return products;
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

export async function getCatalogProductBySlug(slug: string): Promise<Product | null> {
  const products = await getAllCatalogProducts();
  return products.find((p) => p.slug === slug) ?? null;
}
