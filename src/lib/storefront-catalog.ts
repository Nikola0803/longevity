import type { Product } from "@/lib/product-types";
import { PRODUCTS } from "@/data/products";

/**
 * Public storefront catalog reads — runs directly in the browser now that
 * this app is a static Vite SPA (no Node server to hide a secret key
 * behind), so this uses WooCommerce's public Store API (`wc/store/v1`,
 * no auth) instead of the old server-side wc/v3 + consumer key/secret
 * call. Store API is the same public, unauthenticated endpoint a
 * shopper's browser hits when it loads any WooCommerce store's own shop
 * page — safe to call with nothing but the store's URL.
 *
 * Configure via Vite env (see .env.example):
 *   VITE_WOO_STORE_URL=https://yourstore.com
 * Unset, or a failed request, falls back to the static PRODUCTS array in
 * src/data/products.ts — a real catalog with real photos already in
 * public/images/, so the storefront is never empty.
 *
 * KNOWN GAP: Store API's product-list endpoint doesn't reliably expose a
 * variable product's per-variation price/stock/attribute breakdown the
 * way wc/v3 did — verifying the exact response shape needs a live store to
 * test against (no outbound network in this dev sandbox). Until that's
 * confirmed, live Woo products come through as simple products only; the
 * dose/pack-size splitting UI is fully wired and demonstrated against the
 * static PRODUCTS fallback below.
 */

interface WooStoreImage {
  src: string;
  alt: string;
}
interface WooStoreProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  description: string;
  short_description: string;
  sku: string;
  prices: { price: string; currency_minor_unit: number };
  is_in_stock: boolean;
  categories: Array<{ name: string }>;
  images: WooStoreImage[];
}

const CATALOG_TTL_MS = 60_000;
let cache: { at: number; products: Product[] } | null = null;

function wooStoreUrl(): string | null {
  const url = import.meta.env.VITE_WOO_STORE_URL as string | undefined;
  return url ? url.replace(/\/$/, "") : null;
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

function adaptWooProduct(p: WooStoreProduct): Product {
  const category = p.categories[0]?.name ?? "Peptides";
  const description = stripHtml(p.description || p.short_description || "");
  const images = p.images.map((i) => i.src);
  const image = images[0] ?? "/images/placeholder.png";
  const minorUnit = p.prices.currency_minor_unit ?? 2;
  const price = parseInt(p.prices.price || "0", 10) / 10 ** minorUnit;
  const inStock = p.is_in_stock;

  return {
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
    wooProductId: p.id,
    packSize: 1,
  };
}

export async function getAllCatalogProducts(): Promise<Product[]> {
  const base = wooStoreUrl();
  if (!base) return PRODUCTS;
  if (cache && Date.now() - cache.at < CATALOG_TTL_MS) return cache.products;

  try {
    const res = await fetch(`${base}/wp-json/wc/store/v1/products?per_page=100`);
    if (!res.ok) throw new Error(`WooCommerce Store API ${res.status}`);
    const items: WooStoreProduct[] = await res.json();
    const products = items.map(adaptWooProduct);
    cache = { at: Date.now(), products };
    return products;
  } catch {
    return PRODUCTS;
  }
}

export async function getCatalogProductBySlug(slug: string): Promise<Product | null> {
  const products = await getAllCatalogProducts();
  return products.find((p) => p.slug === slug) ?? null;
}
