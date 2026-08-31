"use server";

import { revalidatePath } from "next/cache";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function createTicket(formData: FormData) {
  const { organization } = await requireOrg();

  await prisma.supportTicket.create({
    data: {
      organizationId: organization.id,
      contactEmail: String(formData.get("contactEmail") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      orderRef: (formData.get("orderRef") as string) || null,
    },
  });

  revalidatePath("/admin/support");
}

export async function replyToTicket(formData: FormData) {
  const { organization } = await requireOrg();
  const ticketId = String(formData.get("ticketId"));
  const body = String(formData.get("body") || "").trim();
  if (!body) return;

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, organizationId: organization.id },
  });
  if (!ticket) return;

  await prisma.supportReply.create({
    data: { ticketId: ticket.id, body, fromStaff: true },
  });
  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: { status: "PENDING" },
  });

  revalidatePath(`/admin/support/${ticketId}`);
}

export async function setTicketStatus(formData: FormData) {
  const { organization } = await requireOrg();
  const ticketId = String(formData.get("ticketId"));
  const status = String(formData.get("status")) as "OPEN" | "PENDING" | "RESOLVED";

  await prisma.supportTicket.updateMany({
    where: { id: ticketId, organizationId: organization.id },
    data: { status },
  });

  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
}
