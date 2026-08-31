import { NextResponse } from "next/server";
import { getAllCatalogProducts } from "@/lib/woo";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getAllCatalogProducts();
  return NextResponse.json(products);
}
