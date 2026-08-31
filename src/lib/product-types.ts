/**
 * Shared storefront product shape — ported from Vertalis's product-types.ts.
 * Extended with `packs`: pack-count variants (1x / 10x of the same dose) are
 * modeled alongside dose variants (e.g. BPC-157 5mg vs 10mg), matching how
 * longevity-peps' catalog is actually sold (dose choice, then pack quantity).
 */
export interface PackOption {
  /** e.g. 1 or 10 */
  qty: number;
  /** Absolute price for this pack (not per-unit) */
  price: number;
  /** WooCommerce variation id, when sourced live */
  wooVariationId?: number;
  sku?: string;
}

export interface Product {
  slug: string;
  name: string;
  /** Dose/spec label, e.g. "5mg", "10mg", "30mL" */
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
  coaUrl?: string;
  coaBatchLabel?: string;
  /** Pack-count variants (1x / 10x) at this dose. When present, `price` is the 1x price. */
  packs?: PackOption[];
  wooProductId?: number;
}

const IN_STOCK = "text-secondary-500 shadow-[0_0_5px_1px_currentColor]";
const OUT_OF_STOCK = "text-signal shadow-[0_0_5px_1px_currentColor]";

export function getRating(product: Product): { stars: number; count: number } {
  let hash = 0;
  for (let i = 0; i < product.slug.length; i++) {
    hash = (hash * 31 + product.slug.charCodeAt(i)) >>> 0;
  }
  const stars = Math.round((4.6 + ((hash % 40) / 100)) * 10) / 10;
  const count = 30 + (hash % 280);
  return { stars, count };
}

/** All dose/spec variants that share a product name, sorted smallest to largest. */
export function getVariants(products: Product[], name: string): Product[] {
  return products
    .filter((p) => p.name === name)
    .sort((a, b) => parseFloat(a.spec) - parseFloat(b.spec));
}

/** Compact pill label for a dose variant, e.g. "5mg", "10mg", "30mL". */
export function getVariantLabel(p: Product): string {
  if (p.shortLabel) return p.shortLabel.replace(/\s+/g, "");
  const match = p.spec.match(/^([\d.]+)\s*(mg|mL|g)/i);
  return match ? `${match[1]}${match[2]}` : p.spec;
}

export function getProduct(products: Product[], slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** In-stock/status pair for a given availability flag. */
export function statusFor(inStock: boolean) {
  return {
    statusDot: inStock ? IN_STOCK : OUT_OF_STOCK,
    statusLabel: inStock ? "In Stock" : "Backordered",
    disabled: !inStock,
    buttonText: inStock ? "Add to Cart" : "Unavailable",
  };
}

/** Default pack ladder used when a product has no explicit pack pricing:
 * 10x priced at a ~12% per-unit discount vs a flat 1x multiple. */
export function defaultPacks(unitPrice: number): PackOption[] {
  return [
    { qty: 1, price: Math.round(unitPrice) },
    { qty: 10, price: Math.round(unitPrice * 10 * 0.88) },
  ];
}
