import { NextRequest, NextResponse } from "next/server";
import { checkSubdomainAvailable, slugifySubdomain } from "@/lib/subdomain";

export const dynamic = "force-dynamic";

// GET /api/onboard/check-subdomain?slug=my-store
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("slug") ?? "";
  const slug = slugifySubdomain(raw);
  if (!slug) {
    return NextResponse.json({ available: false, slug: "", reason: "Enter a name." });
  }
  const check = await checkSubdomainAvailable(slug);
  return NextResponse.json({ available: check.ok, slug, reason: check.reason ?? null });
}
