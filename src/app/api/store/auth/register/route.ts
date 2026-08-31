import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";
import { createCustomerToken } from "@/lib/customer-auth";
import { subscribeToMailchimp } from "@/lib/mailchimp";

export const runtime = "nodejs";

// POST /api/store/auth/register { email, password, name?, marketingOptIn? }
// Replaces the nvr-account WP plugin's /register endpoint. Customer
// accounts now live in the same database as everything else (Customer
// model), not in a separate WordPress users table.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, password, name, marketingOptIn } = body ?? {};
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (String(password).length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const { organizationId } = await getStoreContext();
  const normalizedEmail = String(email).toLowerCase().trim();

  const existing = await prisma.customer.findUnique({
    where: { organizationId_email: { organizationId, email: normalizedEmail } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try signing in." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const customer = await prisma.customer.create({
    data: { organizationId, email: normalizedEmail, passwordHash, name, marketingOptIn: Boolean(marketingOptIn) },
  });

  if (marketingOptIn) {
    await prisma.contact.upsert({
      where: { organizationId_email: { organizationId, email: normalizedEmail } },
      update: {},
      create: { organizationId, email: normalizedEmail },
    });
    subscribeToMailchimp(normalizedEmail, { firstName: name || undefined }).catch(() => {});
  }

  const token = createCustomerToken(customer.id);
  return NextResponse.json({ token, email: customer.email, username: customer.name ?? customer.email, user_id: customer.id });
}
