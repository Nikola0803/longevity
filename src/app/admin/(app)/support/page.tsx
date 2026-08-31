import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, Badge, EmptyState, Card } from "@/components/ui";
import { dateTime } from "@/lib/format";
import Link from "next/link";
import { createTicket } from "./actions";

export default async function SupportPage() {
  const { organization } = await requireOrg();

  const tickets = await prisma.supportTicket.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const open = tickets.filter((t) => t.status === "OPEN").length;
  const pending = tickets.filter((t) => t.status === "PENDING").length;
  const resolved = tickets.filter((t) => t.status === "RESOLVED").length;

  return (
    <div>
      <PageHeader title="Support" subtitle="Customer conversations in one place" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Open" value={String(open)} hint="Needs a first reply" />
        <StatCard label="Pending" value={String(pending)} hint="Waiting on customer" />
        <StatCard label="Resolved" value={String(resolved)} hint="All-time" />
      </div>

      <Card className="p-4 mb-6">
        <h2 className="text-sm font-semibold text-cc-foreground-950 mb-3">Log a new ticket</h2>
        <form action={createTicket} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            name="contactEmail"
            type="email"
            required
            placeholder="Customer email"
            className="rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
          />
          <input
            name="orderRef"
            placeholder="Order # (optional)"
            className="rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
          />
          <input
            name="subject"
            required
            placeholder="Subject"
            className="sm:col-span-2 rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
          />
          <textarea
            name="message"
            required
            rows={3}
            placeholder="What did the customer say?"
            className="sm:col-span-2 rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
          />
          <button className="sm:col-span-2 justify-self-start text-sm bg-cc-primary-500 text-cc-background-50 rounded-md px-4 py-2 font-medium hover:bg-cc-primary-600">
            Create ticket
          </button>
        </form>
      </Card>

      {tickets.length === 0 ? (
        <EmptyState
          icon="ri-customer-service-2-line"
          title="No tickets yet"
          body="Log a ticket above, or wire the storefront contact form to POST into this table."
        />
      ) : (
        <div className="rounded-lg border border-cc-background-200 bg-cc-background-50 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-cc-foreground-500 border-b border-cc-background-200">
                <th className="py-2.5 px-4 font-medium">Subject</th>
                <th className="py-2.5 px-4 font-medium">Customer</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Opened</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-cc-background-100 last:border-0">
                  <td className="py-3 px-4 text-cc-foreground-800">
                    <Link href={`/admin/support/${t.id}`} className="hover:underline">
                      {t.subject}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-cc-foreground-700">{t.contactEmail}</td>
                  <td className="py-3 px-4">
                    <Badge status={t.status} />
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-cc-foreground-500 whitespace-nowrap">
                    {dateTime(t.createdAt)}
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
