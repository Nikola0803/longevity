import type { Product } from "@/lib/product-types";
import { PRODUCTS } from "@/data/products";

/**
 * Public storefront catalog reads — calls the longevity-content-manager
 * plugin's own `/wp-json/longevity/v1/catalog` endpoint (see
 * class-catalog-api.php), not WooCommerce's Store API directly. That
 * endpoint is built straight off WooCommerce's PHP product objects on the
 * server, so it can reliably return full dose + pack-size variation data
 * in one call — something the Store API's product-list endpoint doesn't
 * consistently expose across WooCommerce versions. It already returns
 * every field in this app's `Product` shape except the presentational
 * `statusDot` class string, filled in below.
 *
 * Configure via Vite env (see .env.example):
 *   VITE_WOO_STORE_URL=https://yourstore.com
 * Unset, or a failed request, falls back to the static PRODUCTS array in
 * src/data/products.ts — a real catalog with real photos already in
 * public/images/, so the storefront is never empty.
 */

type CatalogEntry = Omit<Product, "statusDot">;

const CATALOG_TTL_MS = 60_000;
let cache: { at: number; products: Product[] } | null = null;

function wooStoreUrl(): string | null {
  const url = import.meta.env.VITE_WOO_STORE_URL as string | undefined;
  return url ? url.replace(/\/$/, "") : null;
}

const IN_STOCK = "text-secondary-500 shadow-[0_0_5px_1px_currentColor]";
const OUT_OF_STOCK = "text-signal shadow-[0_0_5px_1px_currentColor]";

function withStatusDot(entry: CatalogEntry): Product {
  return { ...entry, statusDot: entry.disabled ? OUT_OF_STOCK : IN_STOCK };
}

export async function getAllCatalogProducts(): Promise<Product[]> {
  const base = wooStoreUrl();
  if (!base) return PRODUCTS;
  if (cache && Date.now() - cache.at < CATALOG_TTL_MS) return cache.products;

  try {
    const res = await fetch(`${base}/wp-json/longevity/v1/catalog`);
    if (!res.ok) throw new Error(`Catalog API ${res.status}`);
    const items: CatalogEntry[] = await res.json();
    if (!Array.isArray(items) || items.length === 0) return PRODUCTS;
    const products = items.map(withStatusDot);
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
