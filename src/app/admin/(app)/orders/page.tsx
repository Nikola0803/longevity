import Link from "next/link";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import { OrdersFilters } from "@/components/orders-filters";
import { money, dateTime } from "@/lib/format";

const STATUS_MAP: Record<string, "PENDING" | "COMPLETED" | "PROCESSING" | "ON_HOLD" | "REFUNDED" | "CANCELLED"> = {
  pending: "PENDING",
  completed: "COMPLETED",
  processing: "PROCESSING",
  "on-hold": "ON_HOLD",
  refunded: "REFUNDED",
  cancelled: "CANCELLED",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { brand?: string; status?: string };
}) {
  const { organization } = await requireOrg();

  const [brands, orders] = await Promise.all([
    prisma.brand.findMany({ where: { organizationId: organization.id }, orderBy: { name: "asc" } }),
    prisma.order.findMany({
      where: {
        organizationId: organization.id,
        ...(searchParams.brand ? { brandId: searchParams.brand } : {}),
        ...(searchParams.status ? { status: STATUS_MAP[searchParams.status] } : {}),
      },
      orderBy: { placedAt: "desc" },
      include: { brand: true, contact: true },
      take: 100,
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} of ${orders.length} orders`}
        actions={
          <>
            <OrdersFilters brands={brands} />
            <button className="text-sm border border-cc-background-300 rounded-md px-3 py-1.5 text-cc-foreground-800 hover:bg-cc-background-100 whitespace-nowrap">
              Export CSV
            </button>
            <button className="text-sm bg-cc-primary-500 text-cc-background-50 rounded-md px-3 py-1.5 font-medium hover:bg-cc-primary-600 whitespace-nowrap">
              Sync all brands
            </button>
          </>
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          icon="ri-shopping-bag-3-line"
          title="No orders match these filters"
          body="Try a different brand or status, or connect a store from the Webhooks page."
        />
      ) : (
        <div className="rounded-lg border border-cc-background-200 bg-cc-background-50 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-cc-foreground-500 border-b border-cc-background-200">
                <th className="py-2.5 px-4 font-medium">Order</th>
                <th className="py-2.5 px-4 font-medium">Customer</th>
                <th className="py-2.5 px-4 font-medium">Brand</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Coupon</th>
                <th className="py-2.5 px-4 font-medium text-right">Gross</th>
                <th className="py-2.5 px-4 font-medium text-right">Net profit</th>
                <th className="py-2.5 px-4 font-medium text-right">Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-cc-background-100 last:border-0 hover:bg-cc-background-100/60 cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono text-xs text-cc-foreground-700">
                    <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                      #{o.externalOrderNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-cc-foreground-800">{o.contact?.email ?? o.customerEmail ?? "—"}</td>
                  <td className="py-3 px-4 text-cc-foreground-700">{o.brand.name}</td>
                  <td className="py-3 px-4">
                    <Badge status={o.status} />
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-cc-foreground-600">{o.couponCode ?? "—"}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{money(o.grossCents)}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-cc-foreground-700">
                    {o.netProfitCents != null ? money(o.netProfitCents) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-cc-foreground-500 whitespace-nowrap">
                    {dateTime(o.placedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
