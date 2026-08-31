import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentBrand } from "@/lib/store-context";
import { toProductView, type Product } from "@/lib/product-types";

/**
 * Server-side catalog reads. Two modes, chosen automatically per brand:
 *
 *  - PER-BRAND (network resellers): the brand has BrandProduct rows, so we
 *    return only the SKUs it carries, priced at ITS retail (retailPriceCents),
 *    while the shared master Product row keeps the wholesale cost (cogsCents)
 *    the reseller never sees.
 *
 *  - GLOBAL (the flagship brand today): the brand has no BrandProduct rows, so
 *    we return every catalog product at the master priceCents, byte-for-byte
 *    the old behaviour, so Vertalis is completely unaffected until you opt it
 *    into per-brand pricing by giving it BrandProduct rows.
 */

async function brandHasOwnPricing(brandId: string): Promise<boolean> {
  const n = await prisma.brandProduct.count({ where: { brandId } });
  return n > 0;
}

export async function getAllCatalogProducts(): Promise<Product[]> {
  const brand = await getCurrentBrand();

  if (await brandHasOwnPricing(brand.id)) {
    const rows = await prisma.brandProduct.findMany({
      where: { brandId: brand.id, carried: true, product: { slug: { not: null } } },
      include: { product: { include: { coas: true } } },
      orderBy: { product: { createdAt: "asc" } },
    });
    return rows.map((bp) => toProductView({ ...bp.product, priceCents: bp.retailPriceCents }));
  }

  const rows = await prisma.product.findMany({
    where: { organizationId: brand.organizationId, slug: { not: null } },
    include: { coas: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toProductView);
}

export async function getCatalogProductBySlug(slug: string): Promise<Product | null> {
  const brand = await getCurrentBrand();

  if (await brandHasOwnPricing(brand.id)) {
    const bp = await prisma.brandProduct.findFirst({
      where: { brandId: brand.id, carried: true, product: { slug } },
      include: { product: { include: { coas: true } } },
    });
    return bp ? toProductView({ ...bp.product, priceCents: bp.retailPriceCents }) : null;
  }

  const row = await prisma.product.findFirst({
    where: { organizationId: brand.organizationId, slug },
    include: { coas: true },
  });
  return row ? toProductView(row) : null;
}

/** Raw master row (admin/detail use), org-scoped, price is master price, unchanged. */
export async function getCatalogProductRowBySlug(slug: string) {
  const brand = await getCurrentBrand();
  return prisma.product.findFirst({ where: { organizationId: brand.organizationId, slug } });
}
