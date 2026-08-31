import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCustomerToken } from "@/lib/customer-auth";

export const runtime = "nodejs";

// POST /api/auth/validate { token } -> { valid, email?, username?, user_id? }
// Token validity itself is org-agnostic (HMAC-signed, no DB lookup needed to
// check the signature), so this intentionally doesn't go through
// getStoreContext() -- any brand's frontend can validate any of its own
// tokens against this one endpoint.
export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ valid: false });
  const customerId = verifyCustomerToken(token);
  if (!customerId) return NextResponse.json({ valid: false });

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) return NextResponse.json({ valid: false });

  return NextResponse.json({ valid: true, email: customer.email, username: customer.name ?? customer.email, user_id: customer.id });
}
