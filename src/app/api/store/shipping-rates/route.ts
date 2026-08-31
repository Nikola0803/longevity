import { NextResponse } from "next/server";
import { DEFAULT_SHIPPING_RATES } from "@/lib/shipping";

export async function GET() {
  return NextResponse.json(DEFAULT_SHIPPING_RATES);
}
