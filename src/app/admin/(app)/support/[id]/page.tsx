import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/ui";
import { dateTime } from "@/lib/format";
import { notFound } from "next/navigation";
import { replyToTicket, setTicketStatus } from "../actions";

export default async function TicketPage({ params }: { params: { id: string } }) {
  const { organization } = await requireOrg();

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: params.id, organizationId: organization.id },
    include: { replies: { orderBy: { createdAt: "asc" } } },
  });
  if (!ticket) notFound();

  return (
    <div>
      <PageHeader
        title={ticket.subject}
        subtitle={`${ticket.contactEmail}${ticket.orderRef ? ` · Order #${ticket.orderRef}` : ""}`}
        actions={
          <form action={setTicketStatus} className="flex items-center gap-2">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <select
              name="status"
              defaultValue={ticket.status}
              className="text-sm border border-cc-background-300 rounded-md px-2.5 py-1.5 bg-cc-background-50 text-cc-foreground-800"
            >
              <option value="OPEN">Open</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <button className="text-sm border border-cc-background-300 rounded-md px-3 py-1.5 text-cc-foreground-800 hover:bg-cc-background-100">
              Update
            </button>
          </form>
        }
      />

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-cc-foreground-500">{dateTime(ticket.createdAt)}</span>
          <Badge status={ticket.status} />
        </div>
        <p className="text-sm text-cc-foreground-800 whitespace-pre-wrap">{ticket.message}</p>
      </Card>

      {ticket.replies.map((r) => (
        <Card key={r.id} className="p-4 mb-4 ml-8">
          <div className="text-xs text-cc-foreground-500 mb-2">
            {r.fromStaff ? "Staff" : "Customer"} · {dateTime(r.createdAt)}
          </div>
          <p className="text-sm text-cc-foreground-800 whitespace-pre-wrap">{r.body}</p>
        </Card>
      ))}

      <Card className="p-4">
        <form action={replyToTicket} className="flex flex-col gap-2">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <textarea
            name="body"
            required
            rows={3}
            placeholder="Write a reply..."
            className="rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
          />
          <button className="self-start text-sm bg-cc-primary-500 text-cc-background-50 rounded-md px-4 py-2 font-medium hover:bg-cc-primary-600">
            Send reply
          </button>
        </form>
      </Card>
    </div>
  );
}
