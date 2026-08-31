import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";
import { createCustomerToken } from "@/lib/customer-auth";

export const runtime = "nodejs";

// POST /api/auth/login { email, password }
// Storefront customer login — same path/contract the old nvr-account WP
// plugin exposed, now backed by the CRM/CMS's own Customer table instead
// of a separate WordPress users table. (Staff CRM login is unaffected —
// that's NextAuth at /api/auth/[...nextauth], a static route like this
// one always wins over the catch-all for an exact path match.)
export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const { organizationId } = await getStoreContext();
  const customer = await prisma.customer.findUnique({
    where: { organizationId_email: { organizationId, email: String(email).toLowerCase().trim() } },
  });
  if (!customer || !(await bcrypt.compare(String(password), customer.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = createCustomerToken(customer.id);
  return NextResponse.json({ token, email: customer.email, username: customer.name ?? customer.email, user_id: customer.id });
}
