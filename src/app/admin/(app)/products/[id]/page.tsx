import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import ProductForm from "@/components/product-form";
import { deleteProduct, addCoaDocument, deleteCoaDocument } from "../actions";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { organization } = await requireOrg();
  const product = await prisma.product.findFirst({ where: { id: params.id, organizationId: organization.id } });
  if (!product) notFound();

  const coas = await prisma.coaDocument.findMany({ where: { productId: product.id }, orderBy: { createdAt: "desc" } });

  const images = Array.isArray(product.images) ? (product.images as string[]) : [];

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-xs text-cc-foreground-500 hover:text-cc-foreground-800 mb-3">
        <i className="ri-arrow-left-line" /> Back to products
      </Link>
      <PageHeader
        title={product.name ?? product.sku}
        subtitle="Edit product"
        actions={
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <button className="text-sm border border-cc-background-300 rounded-md px-3 py-1.5 text-cc-accent-700 hover:bg-cc-accent-100">
              Delete
            </button>
          </form>
        }
      />
      <ProductForm
        initial={{
          id: product.id,
          name: product.name ?? "",
          slug: product.slug ?? "",
          sku: product.sku,
          category: product.category ?? "Peptides",
          spec: product.spec ?? "",
          purity: product.purity ?? "",
          price: (product.priceCents ?? 0) / 100,
          compareAt: product.compareAtCents ? product.compareAtCents / 100 : null,
          cogs: product.cogsCents / 100,
          stock: product.masterStock,
          inStock: product.inStock,
          featured: product.featured,
          hidden: product.hidden,
          description: product.description ?? "",
          shortDescription: product.shortDescription ?? "",
          images,
          seoTitle: product.seoTitle ?? "",
          seoDescription: product.seoDescription ?? "",
          seoImage: product.seoImage ?? "",
        }}
      />

      <div className="mt-8 rounded-lg border border-cc-background-300 bg-white p-5">
        <h2 className="text-sm font-semibold text-cc-foreground-900">Certificate of Analysis (COA) documents</h2>
        <p className="mt-1 text-xs text-cc-foreground-500">
          Real lab PDFs shown as-is on the storefront&apos;s /coas page. Upload the PDF somewhere (e.g. your file host / CDN)
          and paste its direct URL here — the storefront links straight to it, no fabricated stats are shown.
        </p>

        {coas.length > 0 && (
          <ul className="mt-4 space-y-2">
            {coas.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded-md border border-cc-background-200 px-3 py-2 text-sm">
                <a href={c.url} target="_blank" rel="noreferrer" className="truncate text-cc-accent-700 hover:underline">
                  {c.label || c.url}
                </a>
                <form action={deleteCoaDocument}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="productId" value={product.id} />
                  <button className="shrink-0 text-xs text-cc-foreground-400 hover:text-cc-accent-700">Remove</button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={addCoaDocument} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="productId" value={product.id} />
          <div className="flex-1 min-w-[220px]">
            <label className="mb-1 block text-xs font-medium text-cc-foreground-600">PDF URL</label>
            <input name="url" type="url" required placeholder="https://.../coa-batch-08.pdf" className="w-full rounded-md border border-cc-background-300 px-3 py-2 text-sm" />
          </div>
          <div className="w-40">
            <label className="mb-1 block text-xs font-medium text-cc-foreground-600">Batch / lot label</label>
            <input name="label" type="text" placeholder="e.g. ALT-BPC10-08" className="w-full rounded-md border border-cc-background-300 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-md bg-cc-accent-700 px-4 py-2 text-sm font-medium text-white hover:bg-cc-accent-800">
            Add COA
          </button>
        </form>
      </div>
    </div>
  );
}
