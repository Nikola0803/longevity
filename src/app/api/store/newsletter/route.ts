import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";
import { subscribeToMailchimp } from "@/lib/mailchimp";

export const runtime = "nodejs";

// POST /api/store/newsletter { email }
// Signups land as Contacts in the CRM first and always, so they show up
// alongside customers who've actually ordered and survive even if
// Mailchimp is down or misconfigured, then get pushed to Mailchimp
// best-effort.
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const { organizationId } = await getStoreContext();
  await prisma.contact.upsert({
    where: { organizationId_email: { organizationId, email: normalizedEmail } },
    update: {},
    create: { organizationId, email: normalizedEmail },
  });

  const mailchimp = await subscribeToMailchimp(normalizedEmail);
  return NextResponse.json({ ok: true, mailchimp: mailchimp.ok });
}
