/**
 * The public URL a store lives at.
 *
 * Priority mirrors host resolution (see brand-resolver.ts):
 *   1. customDomain, if the reseller connected one
 *   2. otherwise the guaranteed fallback: <subdomain>.<PLATFORM_ROOT_DOMAIN>
 *
 * In dev we hand back <subdomain>.localhost:<port>, which resolves to
 * 127.0.0.1 in Chrome/Firefox with no hosts-file edits, so a freshly
 * onboarded store is clickable immediately.
 */

const ROOT_DOMAIN = (process.env.PLATFORM_ROOT_DOMAIN ?? "").toLowerCase().trim();
const DEV_PORT = process.env.PORT ?? "3000";

export function storeUrl(brand: { subdomain: string | null; customDomain: string | null }): string {
  if (brand.customDomain) return `https://${brand.customDomain}`;

  const sub = brand.subdomain;
  if (!sub) return "";

  if (process.env.NODE_ENV !== "production") {
    return `http://${sub}.localhost:${DEV_PORT}`;
  }
  if (ROOT_DOMAIN) return `https://${sub}.${ROOT_DOMAIN}`;
  // No root domain configured in prod yet: best effort, still valid to display.
  return `https://${sub}.example.com`;
}
