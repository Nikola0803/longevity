import Link from "next/link";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, Card, Badge, EmptyState } from "@/components/ui";
import { money, dateTime } from "@/lib/format";

export default async function DashboardPage() {
  const { organization } = await requireOrg();
  const orgId = organization.id;

  const [brands, orderAgg, ordersToday, recentOrders, lowStockCount, openCommission] =
    await Promise.all([
      prisma.brand.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: "asc" } }),
      prisma.order.aggregate({
        where: { organizationId: orgId },
        _sum: { grossCents: true, netProfitCents: true },
        _count: true,
      }),
      prisma.order.count({
        where: {
          organizationId: orgId,
          placedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.order.findMany({
        where: { organizationId: orgId },
        orderBy: { placedAt: "desc" },
        take: 6,
        include: { brand: true, contact: true },
      }),
      prisma.product.count({ where: { organizationId: orgId, masterStock: { lte: 0 } } }),
      prisma.affiliateOrderAttribution.aggregate({
        where: { affiliate: { organizationId: orgId } },
        _sum: { commissionCents: true },
      }),
    ]);

  const connectedBrands = brands.filter((b) => b.status === "CONNECTED");
  const pendingBrands = brands.filter((b) => b.status !== "CONNECTED");

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`${connectedBrands.length} of ${brands.length} brands connected · ${ordersToday} orders today`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Gross revenue" value={money(orderAgg._sum.grossCents ?? 0)} hint="All-time, all brands" />
        <StatCard
          label="Net profit"
          value={money(orderAgg._sum.netProfitCents ?? 0)}
          hint="After COGS, fees, commission"
        />
        <StatCard label="Total orders" value={String(orderAgg._count)} hint="All-time" />
        <StatCard
          label="Affiliate commission owed"
          value={money(openCommission._sum.commissionCents ?? 0)}
          hint="Across attributed orders"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground-950">Recent orders</h2>
            <Link href="/orders" className="text-xs text-primary-600 font-medium hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState
              icon="ri-shopping-bag-3-line"
              title="No orders yet"
              body="Once a brand's WooCommerce store is connected, orders will appear here in real time."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-foreground-500 border-b border-background-200">
                    <th className="py-2 font-medium">Order</th>
                    <th className="py-2 font-medium">Customer</th>
                    <th className="py-2 font-medium">Brand</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium text-right">Gross</th>
                    <th className="py-2 font-medium text-right">Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-background-100 last:border-0">
                      <td className="py-2.5 font-mono text-xs text-foreground-700">#{o.externalOrderNumber}</td>
                      <td className="py-2.5 text-foreground-800">{o.contact?.email ?? "—"}</td>
                      <td className="py-2.5 text-foreground-700">{o.brand.name}</td>
                      <td className="py-2.5">
                        <Badge status={o.status} />
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{money(o.grossCents)}</td>
                      <td className="py-2.5 text-right text-xs text-foreground-500">{dateTime(o.placedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground-950">Brands</h2>
            <Link href="/webhooks" className="text-xs text-primary-600 font-medium hover:underline">
              Connect a brand
            </Link>
          </div>
          <div className="space-y-2">
            {brands.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-3 py-2 rounded-md border border-background-200"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground-950 truncate">{b.name}</div>
                  <div className="text-xs text-foreground-500 truncate">{b.domain}</div>
                </div>
                <Badge status={b.status} />
              </div>
            ))}
            {pendingBrands.length === 0 && brands.length > 0 && (
              <p className="text-xs text-foreground-500 pt-1">All brands syncing normally.</p>
            )}
          </div>

          {lowStockCount > 0 && (
            <div className="mt-4 flex items-start gap-2 rounded-md bg-accent-50 border border-accent-200 px-3 py-2">
              <i className="ri-alert-line text-accent-600 mt-0.5" />
              <div className="text-xs text-accent-800">
                {lowStockCount} SKU{lowStockCount > 1 ? "s" : ""} out of master stock.{" "}
                <Link href="/products" className="font-medium underline">
                  Review products
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
