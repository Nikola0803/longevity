import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Subdomain handling for reseller onboarding.
 *
 * Every store gets an instant `<subdomain>.<PLATFORM_ROOT_DOMAIN>` URL. If the
 * reseller also connects their own domain, that wins (see store-url.ts), but
 * the subdomain is always the guaranteed fallback so a store is live the moment
 * it's created, with no DNS wait.
 */

// Labels we never hand to a reseller, because they collide with platform hosts,
// email/infra conventions, or app routes.
const RESERVED = new Set([
  "www", "api", "app", "admin", "dashboard", "login", "logout", "onboard",
  "signup", "register", "account", "billing", "checkout", "cart", "static",
  "cdn", "assets", "img", "images", "media", "mail", "smtp", "imap", "pop",
  "ftp", "ns1", "ns2", "mx", "dns", "autoconfig", "autodiscover", "status",
  "help", "support", "docs", "blog", "shop", "store", "dev", "staging", "test",
  "demo", "root", "system", "internal", "vpn", "webhook", "webhooks", "pixel",
]);

const LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/; // RFC-ish DNS label, 3-63 chars

/** Turn a free-text store name into a candidate subdomain. */
export function slugifySubdomain(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")   // strip accents
    .replace(/[^a-z0-9]+/g, "-")        // non-alnum -> dash
    .replace(/^-+|-+$/g, "")             // trim dashes
    .replace(/-{2,}/g, "-")              // collapse dashes
    .slice(0, 63)
    .replace(/-+$/g, "");
}

export type SubdomainCheck = { ok: boolean; reason?: string };

/** Format/length/reserved validation only (no DB). */
export function validateSubdomainFormat(sub: string): SubdomainCheck {
  const s = (sub ?? "").toLowerCase().trim();
  if (s.length < 3) return { ok: false, reason: "Must be at least 3 characters." };
  if (s.length > 63) return { ok: false, reason: "Must be 63 characters or fewer." };
  if (!LABEL_RE.test(s)) {
    return { ok: false, reason: "Use letters, numbers, and hyphens only, and don't start or end with a hyphen." };
  }
  if (RESERVED.has(s)) return { ok: false, reason: "That name is reserved. Pick another." };
  return { ok: true };
}

/** Full availability check: format + not already taken by another brand. */
export async function checkSubdomainAvailable(sub: string): Promise<SubdomainCheck> {
  const fmt = validateSubdomainFormat(sub);
  if (!fmt.ok) return fmt;
  const existing = await prisma.brand.findUnique({
    where: { subdomain: sub.toLowerCase().trim() },
    select: { id: true },
  });
  if (existing) return { ok: false, reason: "That store address is already taken." };
  return { ok: true };
}
