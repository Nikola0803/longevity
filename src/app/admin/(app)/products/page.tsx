import Link from "next/link";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, EmptyState } from "@/components/ui";
import { money } from "@/lib/format";
import { scoreSeo } from "@/lib/seo-score";
import clsx from "clsx";

export default async function ProductsPage() {
  const { organization } = await requireOrg();

  const products = await prisma.product.findMany({
    where: { organizationId: organization.id },
    include: { coas: true },
    orderBy: { createdAt: "asc" },
  });

  const totalUnits = products.reduce((s, p) => s + p.masterStock, 0);
  const inventoryValue = products.reduce((s, p) => s + p.masterStock * p.cogsCents, 0);
  const outOfStock = products.filter((p) => p.masterStock <= 0).length;
  const weakSeoCount = products.filter((p) => {
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];
    const { score } = scoreSeo({
      title: p.name ?? p.sku,
      slug: p.slug ?? p.sku,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      seoImage: p.seoImage ?? images[0],
      bodyText: p.description,
    });
    return score < 60;
  }).length;

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="The full Vertalis catalog — content, pricing, stock, and SEO all live here"
        actions={
          <Link
            href="/admin/products/new"
            className="text-sm bg-cc-primary-500 text-cc-background-50 rounded-md px-3 py-1.5 font-medium hover:bg-cc-primary-600"
          >
            + Add product
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total products" value={String(products.length)} />
        <StatCard label="Units in stock" value={totalUnits.toLocaleString()} />
        <StatCard label="Inventory value (COGS)" value={money(inventoryValue)} />
        <StatCard
          label="Out of stock"
          value={String(outOfStock)}
          hint={weakSeoCount > 0 ? `${weakSeoCount} product(s) need SEO attention` : "SEO looks good across the catalog"}
        />
      </div>

      {products.length === 0 ? (
        <EmptyState icon="ri-flask-line" title="No products yet" body="Add your first product to get the storefront populated." />
      ) : (
        <div className="rounded-lg border border-cc-background-200 bg-cc-background-50 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-cc-foreground-500 border-b border-cc-background-200">
                <th className="py-2.5 px-4 font-medium">Product</th>
                <th className="py-2.5 px-4 font-medium">Category</th>
                <th className="py-2.5 px-4 font-medium text-right">Price</th>
                <th className="py-2.5 px-4 font-medium text-right">Stock</th>
                <th className="py-2.5 px-4 font-medium text-center">Status</th>
                <th className="py-2.5 px-4 font-medium text-center">SEO</th>
                <th className="py-2.5 px-4 font-medium text-center">COA</th>
                <th className="py-2.5 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const images = Array.isArray(p.images) ? (p.images as string[]) : [];
                const seo = scoreSeo({
                  title: p.name ?? p.sku,
                  slug: p.slug ?? p.sku,
                  seoTitle: p.seoTitle,
                  seoDescription: p.seoDescription,
                  seoImage: p.seoImage ?? images[0],
                  bodyText: p.description,
                });
                return (
                  <tr key={p.id} className="border-b border-cc-background-100 last:border-0">
                    <td className="py-3 px-4">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded bg-cc-background-100 shrink-0 overflow-hidden">
                          {images[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={images[0]} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-cc-foreground-950 font-medium truncate group-hover:underline">
                            {p.name ?? p.sku}
                          </div>
                          <div className="text-xs text-cc-foreground-500 font-mono truncate">{p.slug ?? p.sku}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-cc-foreground-700">{p.category ?? "—"}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-cc-foreground-800">
                      {p.priceCents != null ? money(p.priceCents) : "—"}
                    </td>
                    <td
                      className={clsx(
                        "py-3 px-4 text-right tabular-nums font-medium",
                        p.masterStock <= 0 ? "text-cc-accent-700" : "text-cc-foreground-800"
                      )}
                    >
                      {p.masterStock}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.hidden ? (
                        <span className="text-xs text-cc-foreground-500">Hidden</span>
                      ) : p.inStock ? (
                        <span className="text-xs text-cc-primary-600 font-medium">Live</span>
                      ) : (
                        <span className="text-xs text-cc-accent-700 font-medium">Out of stock</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={clsx(
                          "text-xs font-semibold px-1.5 py-0.5 rounded",
                          seo.score >= 85
                            ? "text-cc-primary-600 bg-cc-primary-100"
                            : seo.score >= 60
                            ? "text-cc-secondary-700 bg-cc-secondary-100"
                            : "text-cc-accent-700 bg-cc-accent-100"
                        )}
                      >
                        {seo.score}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.coas.length > 0 ? (
                        <span className="text-cc-primary-600 text-xs font-medium">{p.coas.length}</span>
                      ) : (
                        <span className="text-cc-foreground-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/admin/products/${p.id}`} className="text-xs text-cc-primary-600 font-medium hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
