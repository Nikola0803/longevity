import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, Badge, EmptyState } from "@/components/ui";
import { money, shortDate } from "@/lib/format";

// Invoices aren't a separate ledger — every completed/processing order IS an
// invoice. This view just presents Orders through an invoicing lens (one row
// per order, a printable-looking reference number, paid/unpaid status) so
// there's no second source of truth to keep in sync.
export default async function InvoicesPage() {
  const { organization } = await requireOrg();

  const orders = await prisma.order.findMany({
    where: { organizationId: organization.id },
    include: { contact: true, brand: true },
    orderBy: { placedAt: "desc" },
    take: 200,
  });

  const paid = orders.filter((o) => o.status === "COMPLETED");
  const outstanding = orders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING" || o.status === "ON_HOLD");
  const totalPaid = paid.reduce((s, o) => s + o.grossCents, 0);
  const totalOutstanding = outstanding.reduce((s, o) => s + o.grossCents, 0);

  return (
    <div>
      <PageHeader title="Invoices" subtitle="One invoice per order — no separate ledger to reconcile" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total invoices" value={String(orders.length)} hint="All-time" />
        <StatCard label="Paid" value={money(totalPaid)} hint={`${paid.length} invoices`} />
        <StatCard label="Outstanding" value={money(totalOutstanding)} hint={`${outstanding.length} invoices`} />
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon="ri-file-list-3-line"
          title="No invoices yet"
          body="Invoices are generated automatically from orders — place or import an order to see one here."
        />
      ) : (
        <div className="rounded-lg border border-cc-background-200 bg-cc-background-50 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-cc-foreground-500 border-b border-cc-background-200">
                <th className="py-2.5 px-4 font-medium">Invoice</th>
                <th className="py-2.5 px-4 font-medium">Billed to</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Amount</th>
                <th className="py-2.5 px-4 font-medium text-right">Issued</th>
                <th className="py-2.5 px-4 font-medium text-right">Payment method</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-cc-background-100 last:border-0">
                  <td className="py-3 px-4 font-mono text-xs text-cc-foreground-700">
                    INV-{o.externalOrderNumber}
                  </td>
                  <td className="py-3 px-4 text-cc-foreground-800">
                    {o.customerName || o.contact?.email || o.customerEmail || "—"}
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={o.status === "COMPLETED" ? "completed" : "pending"} />
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">{money(o.grossCents)}</td>
                  <td className="py-3 px-4 text-right text-xs text-cc-foreground-500 whitespace-nowrap">
                    {shortDate(o.placedAt)}
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-cc-foreground-600 whitespace-nowrap">
                    {o.paymentMethod ?? "—"}
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
