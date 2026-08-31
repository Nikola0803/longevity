import { NextRequest, NextResponse } from "next/server";
import { provisionBrand } from "@/lib/provision";

export const dynamic = "force-dynamic";

// POST /api/onboard/create
// body: { name, subdomain, customDomain?, templateId?, primaryColorRgb? }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== "string" || typeof body.subdomain !== "string") {
    return NextResponse.json({ ok: false, error: "name and subdomain are required." }, { status: 400 });
  }

  const result = await provisionBrand({
    name: body.name,
    subdomain: body.subdomain,
    customDomain: typeof body.customDomain === "string" ? body.customDomain : null,
    templateId: typeof body.templateId === "string" ? body.templateId : undefined,
    primaryColorRgb: typeof body.primaryColorRgb === "string" ? body.primaryColorRgb : null,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
