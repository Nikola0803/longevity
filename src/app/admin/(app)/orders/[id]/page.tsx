import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/ui";
import { money, dateTime } from "@/lib/format";
import { setOrderStatus } from "../actions";

const STATUSES = ["PENDING", "PROCESSING", "ON_HOLD", "COMPLETED", "REFUNDED", "CANCELLED"];

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const { organization } = await requireOrg();

  const order = await prisma.order.findFirst({
    where: { id: params.id, organizationId: organization.id },
    include: { brand: true, contact: true, items: true, attribution: { include: { affiliate: true } } },
  });
  if (!order) notFound();

  const shipping = (order.shippingAddress ?? null) as
    | { address1?: string; city?: string; state?: string; zip?: string; country?: string }
    | null;

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-xs text-cc-foreground-500 hover:text-cc-foreground-800 mb-3">
        <i className="ri-arrow-left-line" /> Back to orders
      </Link>

      <PageHeader
        title={`Order #${order.externalOrderNumber}`}
        subtitle={`Placed ${dateTime(order.placedAt)} · ${order.brand.name}`}
        actions={
          <form action={setOrderStatus} className="flex items-center gap-2">
            <input type="hidden" name="orderId" value={order.id} />
            <select
              name="status"
              defaultValue={order.status}
              className="text-sm border border-cc-background-300 rounded-md px-2.5 py-1.5 bg-cc-background-50 text-cc-foreground-800"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button className="text-sm border border-cc-background-300 rounded-md px-3 py-1.5 text-cc-foreground-800 hover:bg-cc-background-100">
              Update status
            </button>
          </form>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-cc-foreground-950">Items</h2>
            <Badge status={order.status} />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-cc-foreground-500 border-b border-cc-background-200">
                <th className="py-2 font-medium">Item</th>
                <th className="py-2 font-medium">SKU</th>
                <th className="py-2 font-medium text-right">Qty</th>
                <th className="py-2 font-medium text-right">Unit price</th>
                <th className="py-2 font-medium text-right">Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-cc-background-100 last:border-0">
                  <td className="py-2.5 text-cc-foreground-800">{item.name}</td>
                  <td className="py-2.5 font-mono text-xs text-cc-foreground-600">{item.sku}</td>
                  <td className="py-2.5 text-right tabular-nums">{item.quantity}</td>
                  <td className="py-2.5 text-right tabular-nums">{money(item.unitPriceCents)}</td>
                  <td className="py-2.5 text-right tabular-nums">{money(item.unitPriceCents * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 pt-4 border-t border-cc-background-200 flex flex-col items-end gap-1 text-sm">
            <div className="flex justify-between w-48">
              <span className="text-cc-foreground-500">Gross</span>
              <span className="tabular-nums text-cc-foreground-900">{money(order.grossCents)}</span>
            </div>
            {order.netProfitCents != null && (
              <div className="flex justify-between w-48">
                <span className="text-cc-foreground-500">Net profit</span>
                <span className="tabular-nums text-cc-foreground-900">{money(order.netProfitCents)}</span>
              </div>
            )}
            {order.couponCode && (
              <div className="flex justify-between w-48">
                <span className="text-cc-foreground-500">Coupon</span>
                <span className="font-mono text-cc-foreground-700">{order.couponCode}</span>
              </div>
            )}
            {order.attribution && (
              <div className="flex justify-between w-48">
                <span className="text-cc-foreground-500">Affiliate</span>
                <span className="text-cc-foreground-700">
                  {order.attribution.affiliate.name} ({money(order.attribution.commissionCents)})
                </span>
              </div>
            )}
          </div>

          {order.customerNote && (
            <div className="mt-4 pt-4 border-t border-cc-background-200">
              <h3 className="text-xs font-medium text-cc-foreground-500 mb-1">Customer note</h3>
              <p className="text-sm text-cc-foreground-800 whitespace-pre-wrap">{order.customerNote}</p>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-cc-foreground-950 mb-3">Customer</h2>
            <div className="space-y-1.5 text-sm">
              <div className="text-cc-foreground-900 font-medium">{order.customerName || "—"}</div>
              <div className="text-cc-foreground-600">{order.customerEmail || order.contact?.email || "—"}</div>
              <div className="text-cc-foreground-600">{order.customerPhone || "—"}</div>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold text-cc-foreground-950 mb-3">Shipping address</h2>
            {shipping ? (
              <div className="text-sm text-cc-foreground-800 leading-relaxed">
                <div>{shipping.address1}</div>
                <div>
                  {shipping.city}, {shipping.state} {shipping.zip}
                </div>
                <div>{shipping.country || "US"}</div>
              </div>
            ) : (
              <p className="text-sm text-cc-foreground-500">No shipping address on file.</p>
            )}
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold text-cc-foreground-950 mb-3">Payment</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-cc-foreground-500">Method</span>
                <span className="text-cc-foreground-800 capitalize">{order.paymentMethod || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cc-foreground-500">Memo code</span>
                <span className="font-mono text-cc-primary-700 tracking-widest">{order.paymentMemo || "—"}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
