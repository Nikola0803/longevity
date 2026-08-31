import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";
import { createCustomerToken } from "@/lib/customer-auth";

export const runtime = "nodejs";

// POST /api/store/auth/login { email, password }
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
