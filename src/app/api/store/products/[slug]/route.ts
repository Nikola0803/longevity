import { NextResponse } from "next/server";
import { getCatalogProductBySlug } from "@/lib/storefront-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const product = await getCatalogProductBySlug(params.slug);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}
