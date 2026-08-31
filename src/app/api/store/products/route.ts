import { NextResponse } from "next/server";
import { getAllCatalogProducts } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/store/products — public catalog read. Replaces the old
// WooCommerce /wp-json/wc/v3/products call; served straight from the
// CRM/CMS's own Product table now.
export async function GET() {
  const products = await getAllCatalogProducts();
  return NextResponse.json(products);
}
