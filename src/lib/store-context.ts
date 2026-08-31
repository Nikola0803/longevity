import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { resolveHost } from "@/lib/brand-resolver";

/**
 * Multi-tenant storefront resolution.
 *
 * Every public storefront read/write funnels through here, so making THIS
 * function host-aware is what turns the single Longevity Peptides storefront into a
 * network of branded stores without touching the pages themselves.
 *
 * Resolution order for the incoming request's Host header:
 *   1. Brand.customDomain exact match (covers the legacy longevitypeptides.com)
 *   2. Brand.subdomain match  (<sub>.PLATFORM_ROOT_DOMAIN, or <sub>.localhost in dev)
 *   3. Fallback to the env default brand (STORE_ORG_SLUG / STORE_BRAND_SLUG)
 *
 * The fallback is what keeps everything backward compatible: on localhost, on
 * the apex, during static generation, or for any host we don't recognise, you
 * get exactly the Longevity Peptides behaviour you have today.
 *
 * `cache()` memoises per-request (React request scope), replacing the old
 * cross-request module singleton, which would have leaked one brand to every
 * visitor once more than one brand exists.
 */

const DEFAULT_ORG_SLUG = process.env.STORE_ORG_SLUG ?? "vertalis";
const DEFAULT_BRAND_SLUG = process.env.STORE_BRAND_SLUG ?? "vertalis";

export type CurrentBrand = {
  id: string;
  organizationId: string;
  slug: string;
  name: string;
  domain: string;
  subdomain: string | null;
  customDomain: string | null;
  templateId: string;
  themeTokens: unknown;
};

const BRAND_SELECT = {
  id: true,
  organizationId: true,
  slug: true,
  name: true,
  domain: true,
  subdomain: true,
  customDomain: true,
  templateId: true,
  themeTokens: true,
} as const;

async function loadDefaultBrand(): Promise<CurrentBrand> {
  const brand = await prisma.brand.findFirst({
    where: { slug: DEFAULT_BRAND_SLUG, organization: { slug: DEFAULT_ORG_SLUG } },
    select: BRAND_SELECT,
  });
  if (!brand) {
    throw new Error(
      `Default storefront brand not found (org="${DEFAULT_ORG_SLUG}", brand="${DEFAULT_BRAND_SLUG}"). Run "npm run db:seed".`
    );
  }
  return brand;
}

/**
 * Trusted cross-origin override for decoupled frontends (e.g. the EVLV
 * Next.js app calling this CRM's /api/store/* routes from its own domain/
 * server, not from a request whose Host header is this CRM's own domain).
 * A caller presents x-store-domain + x-store-api-key; the key must match the
 * OWNING organization's long-lived Organization.apiKey (same trust model as
 * /api/plugin/register), so a caller can only select brands within an org it
 * already holds the key for -- this can't be used to read another tenant's
 * data by guessing a domain string alone.
 */
async function resolveHeaderOverride(): Promise<CurrentBrand | null> {
  let domain: string | null = null;
  let apiKey: string | null = null;
  try {
    const h = headers();
    domain = h.get("x-store-domain");
    apiKey = h.get("x-store-api-key");
  } catch {
    return null;
  }
  if (!domain || !apiKey) return null;

  const organization = await prisma.organization.findUnique({ where: { apiKey } });
  if (!organization) return null;

  const normalizedDomain = domain.toLowerCase().trim().replace(/^www\./, "");
  const brand = await prisma.brand.findFirst({
    where: {
      organizationId: organization.id,
      OR: [{ customDomain: normalizedDomain }, { domain: normalizedDomain }],
    },
    select: BRAND_SELECT,
  });
  return brand ?? null;
}

/** Full current-brand row, resolved from the request Host header. Memoised per request. */
export const getCurrentBrand = cache(async (): Promise<CurrentBrand> => {
  const override = await resolveHeaderOverride();
  if (override) return override;

  // Dev escape hatch: force a brand without messing with hostnames.
  const forced = process.env.NODE_ENV !== "production" ? process.env.DEV_BRAND_SLUG : undefined;
  if (forced) {
    const brand = await prisma.brand.findFirst({ where: { slug: forced }, select: BRAND_SELECT });
    if (brand) return brand;
  }

  let host: string | null = null;
  try {
    host = headers().get("host");
  } catch {
    // headers() throws outside a request scope (e.g. some static generation) -
    // fall through to the default brand.
  }

  const res = resolveHost(host);

  if (res.kind === "customDomain") {
    const brand = await prisma.brand.findFirst({
      where: { customDomain: res.value, status: { not: "PENDING" } },
      select: BRAND_SELECT,
    });
    if (brand) return brand;
  } else if (res.kind === "subdomain") {
    const brand = await prisma.brand.findFirst({
      where: { subdomain: res.value, status: { not: "PENDING" } },
      select: BRAND_SELECT,
    });
    if (brand) return brand;
  }

  return loadDefaultBrand();
});

/** Back-compat shape used everywhere today. Same fields, now host-aware. */
export const getStoreContext = cache(async (): Promise<{ organizationId: string; brandId: string }> => {
  const brand = await getCurrentBrand();
  return { organizationId: brand.organizationId, brandId: brand.id };
});
