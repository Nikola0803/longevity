import { NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/store-context";
import { getBrandTheme } from "@/lib/brand-theme";
import { storeUrl } from "@/lib/store-url";

export const dynamic = "force-dynamic";

/**
 * GET /api/store/brand
 *
 * The one endpoint a new, decoupled frontend calls first: resolves the
 * current store from the request's Host header (same resolution as every
 * other storefront read, see store-context.ts) and returns just what a
 * frontend needs to render itself, name, template choice, theme colors,
 * and its own canonical URL. No wholesale cost, no org internals.
 *
 * A separate frontend deployment reads its own incoming Host header and
 * forwards it here (e.g. via an `x-forwarded-host` passthrough, or by
 * running behind the same reverse proxy as this API), so this endpoint
 * always answers for the store the visitor is actually on.
 */
export async function GET() {
  const brand = await getCurrentBrand();
  const theme = await getBrandTheme();

  return NextResponse.json({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    templateId: brand.templateId,
    url: storeUrl({ subdomain: brand.subdomain, customDomain: brand.customDomain }),
    subdomain: brand.subdomain,
    customDomain: brand.customDomain,
    theme: {
      // raw token map for a frontend that wants to build its own CSS/theme
      // object, plus the pre-built CSS string this app itself injects.
      tokens: brand.themeTokens ?? null,
      css: theme.css || null,
    },
  });
}
