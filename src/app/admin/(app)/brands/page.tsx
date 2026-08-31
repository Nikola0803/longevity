import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { storeUrl } from "@/lib/store-url";
import { dateTime } from "@/lib/format";

/**
 * The page that answers "how is each brand actually connected to us".
 *
 * A Brand gets here one of two ways, and this page tells you which, per row:
 *
 *  - HOSTED: provisioned through /onboard, sells the shared catalog on its
 *    own subdomain/custom domain at its own BrandProduct prices. This is the
 *    "we build and host their store" model.
 *
 *  - PLUGIN: an existing WooCommerce store that installed the
 *    command-center-connector plugin, self-registered, and now syncs
 *    individual products/orders via StoreMapping + webhooks. This is the
 *    "they keep their own site, we just fulfill" model.
 *
 * Nothing here was previously surfaced anywhere in the admin nav, both kinds
 * of brand existed in the data model but had no dedicated status view.
 */

type BrandRow = {
  id: string;
  name: string;
  domain: string;
  status: string;
  subdomain: string | null;
  customDomain: string | null;
  templateId: string;
  lastSyncedAt: Date | null;
  _count: { products: number; brandProducts: number; orders: number };
};

export default async function BrandsPage() {
  const { organization } = await requireOrg();

  const brands: BrandRow[] = await prisma.brand.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      domain: true,
      status: true,
      subdomain: true,
      customDomain: true,
      templateId: true,
      lastSyncedAt: true,
      _count: { select: { products: true, brandProducts: true, orders: true } },
    },
  });

  const hosted = brands.filter((b) => b._count.brandProducts > 0);
  const plugin = brands.filter((b) => b._count.brandProducts === 0 && b._count.products > 0);
  const unconfigured = brands.filter((b) => b._count.brandProducts === 0 && b._count.products === 0);

  return (
    <div>
      <PageHeader
        title="Brands & Resellers"
        subtitle={`${brands.length} total, ${hosted.length} hosted network store${hosted.length === 1 ? "" : "s"}, ${plugin.length} WooCommerce plugin-connected`}
      />

      {brands.length === 0 ? (
        <Card className="p-4">
          <EmptyState
            icon="ri-store-2-line"
            title="No brands yet"
            body="Provision one through onboarding, or wait for a WooCommerce store to install the connector plugin and self-register."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <BrandGroup
            title="Hosted network stores"
            hint="Built and hosted by us via onboarding. Sells the shared catalog at its own prices."
            brands={hosted}
          />
          <BrandGroup
            title="WooCommerce plugin-connected"
            hint="Their own existing site, running command-center-connector. We fulfill; they keep their store."
            brands={plugin}
          />
          {unconfigured.length > 0 && (
            <BrandGroup
              title="Not yet integrated"
              hint="A Brand row exists but hasn't onboarded a hosted store or synced any products through the plugin yet."
              brands={unconfigured}
            />
          )}
        </div>
      )}
    </div>
  );
}

function BrandGroup({ title, hint, brands }: { title: string; hint: string; brands: BrandRow[] }) {
  if (brands.length === 0) return null;
  return (
    <div>
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-cc-foreground-950">{title}</h2>
        <p className="text-xs text-cc-foreground-500">{hint}</p>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-cc-foreground-500 border-b border-cc-background-200">
              <th className="py-2.5 px-4 font-medium">Brand</th>
              <th className="py-2.5 px-4 font-medium">Address</th>
              <th className="py-2.5 px-4 font-medium">Status</th>
              <th className="py-2.5 px-4 font-medium text-right">SKUs carried</th>
              <th className="py-2.5 px-4 font-medium text-right">Orders</th>
              <th className="py-2.5 px-4 font-medium text-right">Last synced</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => {
              const isHosted = b._count.brandProducts > 0;
              // The live URL: custom domain if connected, else the guaranteed
              // subdomain fallback, same priority as everywhere else.
              const primaryUrl = isHosted
                ? storeUrl({ subdomain: b.subdomain, customDomain: b.customDomain })
                : null;
              // If a custom domain IS set, also show the subdomain fallback
              // underneath (real URL, not a placeholder), since that address
              // stays live even if the custom domain's DNS breaks or lapses.
              const fallbackUrl =
                isHosted && b.customDomain && b.subdomain
                  ? storeUrl({ subdomain: b.subdomain, customDomain: null })
                  : null;

              return (
                <tr key={b.id} className="border-b border-cc-background-100 last:border-0">
                  <td className="py-2.5 px-4">
                    <div className="font-medium text-cc-foreground-950">{b.name}</div>
                    <div className="text-xs text-cc-foreground-500">
                      {isHosted ? `Template: ${b.templateId}` : b.domain}
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    {primaryUrl ? (
                      <a
                        href={primaryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cc-primary-600 hover:underline"
                      >
                        {primaryUrl.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <span className="text-cc-foreground-400">{b.domain || "—"}</span>
                    )}
                    {fallbackUrl && (
                      <div className="text-xs text-cc-foreground-400">
                        fallback:{" "}
                        <a href={fallbackUrl} target="_blank" rel="noreferrer" className="hover:underline">
                          {fallbackUrl.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge status={b.status} />
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums">
                    {isHosted ? b._count.brandProducts : b._count.products}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums">{b._count.orders}</td>
                  <td className="py-2.5 px-4 text-right text-xs text-cc-foreground-500">
                    {b.lastSyncedAt ? dateTime(b.lastSyncedAt) : "Never"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
