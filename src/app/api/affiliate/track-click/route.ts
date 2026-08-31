import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";

export const runtime = "nodejs";

// POST /api/affiliate/track-click { ref_code, landing_url }
export async function POST(req: Request) {
  const { ref_code, landing_url } = await req.json().catch(() => ({}));
  if (!ref_code) return NextResponse.json({ ok: true });

  try {
    const { organizationId } = await getStoreContext();
    const affiliate = await prisma.affiliate.findFirst({
      where: {
        organizationId,
        OR: [{ couponCode: { equals: ref_code, mode: "insensitive" } }, { slug: { equals: ref_code, mode: "insensitive" } }],
      },
    });
    await prisma.webhookEvent.create({
      data: {
        organizationId,
        topic: "affiliate.click",
        payload: { ref_code, landing_url, matched: Boolean(affiliate) },
        signatureValid: true,
        processedAt: new Date(),
      },
    });
  } catch {
    // best-effort — a failed click ping shouldn't affect the visitor
  }
  return NextResponse.json({ ok: true });
}
