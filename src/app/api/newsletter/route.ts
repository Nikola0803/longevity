import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";

export const runtime = "nodejs";

// POST /api/newsletter { email } — signups land as CRM Contacts so they
// show up alongside customers who've actually ordered.
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  const { organizationId } = await getStoreContext();
  await prisma.contact.upsert({
    where: { organizationId_email: { organizationId, email: email.toLowerCase().trim() } },
    update: {},
    create: { organizationId, email: email.toLowerCase().trim() },
  });
  return NextResponse.json({ ok: true });
}
