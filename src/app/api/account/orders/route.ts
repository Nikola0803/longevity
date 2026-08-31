import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCustomerToken } from "@/lib/customer-auth";

export const runtime = "nodejs";

// POST /api/account/orders { token } — resolves "whose orders" from the
// token server-side, same safety property the old WooCommerce-backed
// version had (never trusts a client-supplied customer id/email).
export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const customerId = verifyCustomerToken(token);
  if (!customerId) {
    return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) return NextResponse.json({ error: "Account not found." }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { organizationId: customer.organizationId, customerEmail: customer.email },
    include: { items: true },
    orderBy: { placedAt: "desc" },
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      number: o.externalOrderNumber,
      status: o.status.toLowerCase().replace("_", "-"),
      total: (o.grossCents / 100).toFixed(2),
      date_created: o.placedAt,
      line_items: o.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        total: ((i.unitPriceCents * i.quantity) / 100).toFixed(2),
      })),
    })),
    email: customer.email,
    username: customer.name ?? customer.email,
  });
}
