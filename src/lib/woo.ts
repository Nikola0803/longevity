import "server-only";
import type { Product } from "./product-types";
import { defaultPacks, statusFor } from "./product-types";
import { FALLBACK_PRODUCTS } from "@/data/products";

/**
 * Standard WooCommerce REST API v3 client (store's own consumer key/secret —
 * NOT the Lovable connector-gateway longevity-peps used, which only works
 * inside Lovable's own hosting). Configure via env:
 *   WOO_STORE_URL=https://yourstore.com
 *   WOO_CONSUMER_KEY=ck_...
 *   WOO_CONSUMER_SECRET=cs_...
 * If unset or the request fails, callers fall back to FALLBACK_PRODUCTS so
 * the site never shows an empty shop.
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
  attributes?: Array<{ name: string; options: string[] }>;
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

/** Splits a WooCommerce variable product's variations into dose groups, each
 * carrying its own 1x/10x pack ladder (matched by a "Pack"/"Qty" attribute
 * when present, else synthesized via defaultPacks). */
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
        imgAlt: p.name,
        imgTitle: p.name,
        category,
        purity: "",
        description,
        sku: p.sku,
        wooProductId: p.id,
        packs: defaultPacks(price),
        ...statusFor(inStock),
      },
    ];
  }

  // Group variations by dose (any attribute matching mg/mL/g), pack qty
  // (an attribute matching "pack"/"qty"/"x10") folds into that dose's packs[].
  const doseGroups = new Map<string, WooVariation[]>();
  for (const v of variations) {
    const doseAttr =
      v.attributes.find((a) => /dose|size|spec/i.test(a.name))?.option ??
      v.attributes.find((a) => /mg|ml|g\b/i.test(a.option))?.option ??
      "Default";
    const arr = doseGroups.get(doseAttr) ?? [];
    arr.push(v);
    doseGroups.set(doseAttr, arr);
  }

  return Array.from(doseGroups.entries()).map(([dose, vars]) => {
    const packAttr = (v: WooVariation) =>
      v.attributes.find((a) => /pack|qty|quantity/i.test(a.name))?.option ?? "1";
    const packQty = (raw: string) => {
      const m = raw.match(/(\d+)/);
      return m ? parseInt(m[1], 10) : 1;
    };
    const sorted = [...vars].sort((a, b) => packQty(packAttr(a)) - packQty(packAttr(b)));
    const packs = sorted.map((v) => ({
      qty: packQty(packAttr(v)),
      price: parseFloat(v.price || v.regular_price || "0"),
      wooVariationId: v.id,
      sku: v.sku,
    }));
    const unitPrice = packs.find((pk) => pk.qty === 1)?.price ?? packs[0]?.price ?? 0;
    const inStock = vars.some((v) => v.stock_status === "instock");
    const slugSuffix = dose === "Default" ? "" : `-${dose.toLowerCase().replace(/\s+/g, "")}`;
    return {
      slug: `${p.slug}${slugSuffix}`,
      name: p.name,
      spec: dose === "Default" ? "" : dose,
      price: unitPrice,
      image,
      images,
      imgAlt: `${p.name} ${dose}`.trim(),
      imgTitle: `${p.name} · ${dose}`.trim(),
      category,
      purity: "",
      description,
      sku: sorted[0]?.sku || p.sku,
      wooProductId: p.id,
      packs: packs.length > 1 || packs[0]?.qty !== 1 ? packs : defaultPacks(unitPrice),
      ...statusFor(inStock),
    };
  });
}

export async function getProducts(): Promise<Product[]> {
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
    // Woo unreachable/misconfigured — serve the hardcoded catalog instead
    // of an empty shop.
    return FALLBACK_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}
