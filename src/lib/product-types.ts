/**
 * Shared storefront product shape. Identical to the shape the original
 * Longevity Peptides `data/products.ts` static file exported, so every component
 * ported from that app keeps working unchanged — only where the data
 * comes from has moved (Postgres via the CRM/CMS, not a hardcoded array).
 */
export interface Product {
  slug: string;
  name: string;
  spec: string;
  price: number;
  image: string;
  images?: string[];
  imgAlt: string;
  imgTitle: string;
  category: string;
  statusDot: string;
  statusLabel: string;
  purity: string;
  disabled: boolean;
  buttonText: string;
  footClass?: string | null;
  footText?: string | null;
  shortLabel?: string;
  hidden?: boolean;
  description?: string;
  shortDescription?: string;
  sku?: string;
  /** Most recent real lab CoaDocument for this product, if one has been uploaded. */
  coaUrl?: string;
  coaBatchLabel?: string;
  /** Numeric WooCommerce product id (and variation id, for dose variants) —
   * required to add this item to a real WooCommerce Store API cart at
   * checkout. Absent for fallback-catalog products (no live Woo product
   * behind them), which is exactly why checkout requires Woo to be
   * configured — see src/lib/woo-store-api.ts. */
  wooProductId?: number;
  wooVariationId?: number;
}

const IN_STOCK = "text-secondary-500 shadow-[0_0_5px_1px_currentColor]";
const OUT_OF_STOCK = "text-signal shadow-[0_0_5px_1px_currentColor]";

/** Maps a raw DB row (see lib/catalog.ts) onto the presentational Product shape. */
export function toProductView(row: {
  slug: string | null;
  name: string | null;
  spec: string | null;
  priceCents: number | null;
  images: unknown;
  category: string | null;
  purity: string | null;
  inStock: boolean;
  hidden: boolean;
  description: string | null;
  shortDescription: string | null;
  sku: string;
  coas?: { url: string; label: string | null; createdAt: Date }[];
}): Product {
  const latestCoa = row.coas && row.coas.length > 0
    ? [...row.coas].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
    : null;
  const images = Array.isArray(row.images) ? (row.images as string[]) : [];
  const image = images[0] ?? "/images/placeholder.png";
  const name = row.name ?? row.sku;
  return {
    slug: row.slug ?? row.sku,
    name,
    spec: row.spec ?? "",
    price: (row.priceCents ?? 0) / 100,
    image,
    images,
    imgAlt: `${name} research peptide vial ${row.spec ?? ""}`.trim(),
    imgTitle: `${name} · ${row.spec ?? ""}`.trim(),
    category: row.category ?? "Peptides",
    statusDot: row.inStock ? IN_STOCK : OUT_OF_STOCK,
    statusLabel: row.inStock ? "In Stock" : "Backordered",
    purity: row.purity ?? "",
    disabled: !row.inStock,
    buttonText: row.inStock ? "Add to Cart" : "Unavailable",
    footClass: null,
    footText: null,
    hidden: row.hidden,
    description: row.description ?? undefined,
    shortDescription: row.shortDescription ?? undefined,
    sku: row.sku,
    coaUrl: latestCoa?.url,
    coaBatchLabel: latestCoa?.label ?? undefined,
  };
}

/** Deterministic aggregate star rating + review count fallback for products with no real reviews yet. */
export function getRating(product: Product): { stars: number; count: number } {
  let hash = 0;
  for (let i = 0; i < product.slug.length; i++) {
    hash = (hash * 31 + product.slug.charCodeAt(i)) >>> 0;
  }
  const stars = Math.round((4.6 + ((hash % 40) / 100)) * 10) / 10;
  const count = 30 + (hash % 280);
  return { stars, count };
}

/** All size/variant entries that share a product name, sorted smallest to largest dose. */
export function getVariants(products: Product[], name: string): Product[] {
  return products
    .filter((p) => p.name === name)
    .sort((a, b) => parseFloat(a.spec) - parseFloat(b.spec));
}

/** Compact pill label for a variant, e.g. "5mg", "10mg", "30mL". */
export function getVariantLabel(p: Product): string {
  if (p.shortLabel) return p.shortLabel.replace(/\s+/g, "");
  const match = p.spec.match(/^([\d.]+)\s*(mg|mL|g)/i);
  return match ? `${match[1]}${match[2]}` : p.spec;
}

export function getProduct(products: Product[], slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
