import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";

export const runtime = "nodejs";

// GET /api/store/reviews?slug=nvr-bpc-5
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing ?slug=" }, { status: 400 });

  const { organizationId } = await getStoreContext();
  const product = await prisma.product.findFirst({ where: { organizationId, slug } });
  if (!product) return NextResponse.json([]);

  const reviews = await prisma.review.findMany({
    where: { productId: product.id, approved: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews);
}

// POST /api/store/reviews { slug, rating, reviewerName, reviewerEmail, body }
export async function POST(req: Request) {
  const { slug, rating, reviewerName, reviewerEmail, body } = await req.json().catch(() => ({}));
  if (!slug || !rating || !reviewerName || !reviewerEmail || !body) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { organizationId } = await getStoreContext();
  const product = await prisma.product.findFirst({ where: { organizationId, slug } });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const review = await prisma.review.create({
    data: {
      productId: product.id,
      rating: Math.max(1, Math.min(5, Number(rating))),
      reviewerName,
      reviewerEmail,
      body,
      approved: true,
    },
  });
  return NextResponse.json(review);
}
