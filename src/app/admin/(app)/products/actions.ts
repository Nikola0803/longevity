"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function num(fd: FormData, key: string): number | undefined {
  const v = str(fd, key);
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function imagesFromTextarea(fd: FormData): string[] {
  const raw = fd.get("images");
  if (typeof raw !== "string") return [];
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

// Slugify — keeps SKUs and URLs consistent without the operator having to
// hand-format them (matches the "clean slug" SEO check in lib/seo-score.ts).
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveProduct(formData: FormData) {
  const { organization } = await requireOrg();

  const id = str(formData, "id");
  const name = str(formData, "name") ?? "Untitled product";
  const slug = slugify(str(formData, "slug") ?? name);
  const sku = str(formData, "sku") ?? slug;
  const priceCents = Math.round((num(formData, "price") ?? 0) * 100);
  const cogsCents = Math.round((num(formData, "cogs") ?? 0) * 100);

  const data = {
    organizationId: organization.id,
    sku,
    slug,
    name,
    chemicalName: name,
    category: str(formData, "category"),
    spec: str(formData, "spec"),
    purity: str(formData, "purity"),
    description: str(formData, "description"),
    shortDescription: str(formData, "shortDescription"),
    images: imagesFromTextarea(formData),
    priceCents,
    compareAtCents: num(formData, "compareAt") ? Math.round(num(formData, "compareAt")! * 100) : null,
    cogsCents,
    masterStock: num(formData, "stock") ?? 0,
    inStock: formData.get("inStock") === "on",
    featured: formData.get("featured") === "on",
    hidden: formData.get("hidden") === "on",
    seoTitle: str(formData, "seoTitle"),
    seoDescription: str(formData, "seoDescription"),
    seoImage: str(formData, "seoImage"),
  };

  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    // Ensure this brand's storefront listing exists too, so a brand-new
    // product shows up on the site immediately (mirrors what the seed
    // script does for the original catalog).
    const brand = await prisma.brand.findFirst({ where: { organizationId: organization.id } });
    const product = await prisma.product.create({ data });
    if (brand) {
      await prisma.storeMapping.create({
        data: { productId: product.id, brandId: brand.id, externalProductId: product.slug! },
      });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/product/${slug}`);
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const { organization } = await requireOrg();
  const id = str(formData, "id");
  if (!id) return;

  await prisma.product.deleteMany({ where: { id, organizationId: organization.id } });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

// Real lab CoaDocument PDFs, shown as-is on the storefront /coas page — no
// fabricated purity/date fields, just the actual document the lab issued.
export async function addCoaDocument(formData: FormData) {
  const { organization } = await requireOrg();
  const productId = str(formData, "productId");
  const url = str(formData, "url");
  if (!productId || !url) return;

  const product = await prisma.product.findFirst({ where: { id: productId, organizationId: organization.id } });
  if (!product) return;

  await prisma.coaDocument.create({
    data: { productId, url, label: str(formData, "label") },
  });

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/coas");
}

export async function deleteCoaDocument(formData: FormData) {
  const { organization } = await requireOrg();
  const id = str(formData, "id");
  const productId = str(formData, "productId");
  if (!id || !productId) return;

  const product = await prisma.product.findFirst({ where: { id: productId, organizationId: organization.id } });
  if (!product) return;

  await prisma.coaDocument.delete({ where: { id } });

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/coas");
}
