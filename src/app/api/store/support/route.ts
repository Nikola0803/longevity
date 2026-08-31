import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";

export const runtime = "nodejs";

// POST /api/store/support { contactEmail, subject, message, orderRef? }
// Public entry point for the storefront's contact form. Lands as a
// SupportTicket so it shows up in /admin/support alongside tickets logged
// manually by staff — one queue instead of a separate inbox nobody checks.
export async function POST(req: Request) {
  const { contactEmail, subject, message, orderRef } = await req.json().catch(() => ({}));
  if (!contactEmail || typeof contactEmail !== "string") {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!subject || typeof subject !== "string") {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const { organizationId } = await getStoreContext();
  const ticket = await prisma.supportTicket.create({
    data: {
      organizationId,
      contactEmail: contactEmail.trim(),
      subject: subject.trim(),
      message: message.trim(),
      orderRef: typeof orderRef === "string" && orderRef.trim() ? orderRef.trim() : null,
    },
  });

  return NextResponse.json({ ok: true, ticketId: ticket.id });
}
