/**
 * Pure hostname -> brand-lookup-key parsing. No DB, no `next/headers`, no
 * Node-only APIs, so this stays edge-safe and unit-testable and can be reused
 * later from middleware if you add apex redirects / custom-domain cert hooks.
 *
 * The DB lookup that turns one of these keys into an actual Brand row lives in
 * store-context.ts (Node context, needs Prisma).
 */

export type HostResolution =
  | { kind: "subdomain"; value: string }   // <value>.yourplatform.com  -> Brand.subdomain = value
  | { kind: "customDomain"; value: string } // theirstore.com          -> Brand.customDomain = value
  | { kind: "root" }                        // apex platform domain, localhost, or unknown -> env default brand
  | { kind: "none" };                       // no host at all (e.g. static generation)

/** The platform's own root domain, e.g. "velocitynetwork.com". Subdomains of
 *  this are treated as reseller stores; anything else that isn't the apex is a
 *  connected custom domain. */
const ROOT_DOMAIN = (process.env.PLATFORM_ROOT_DOMAIN ?? "").toLowerCase().trim();

function stripPort(host: string): string {
  return host.split(":")[0].toLowerCase().trim();
}

/**
 * @param rawHost the raw `host` header (may include a port), or null/"".
 */
export function resolveHost(rawHost: string | null | undefined): HostResolution {
  if (!rawHost) return { kind: "none" };
  const host = stripPort(rawHost);
  if (!host) return { kind: "none" };

  // Local dev: `vertalis.localhost`, `aera.localhost` all resolve to 127.0.0.1
  // in Chrome/Firefox with no /etc/hosts edits. Bare `localhost` = root.
  if (host === "localhost" || host === "127.0.0.1") return { kind: "root" };
  if (host.endsWith(".localhost")) {
    const sub = host.slice(0, -".localhost".length);
    return sub ? { kind: "subdomain", value: sub } : { kind: "root" };
  }

  if (ROOT_DOMAIN && (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`)) {
    return { kind: "root" };
  }

  if (ROOT_DOMAIN && host.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = host.slice(0, host.length - ROOT_DOMAIN.length - 1);
    // guard against multi-label leftovers like "a.b.root" -> take the first label
    const label = sub.split(".")[0];
    return label ? { kind: "subdomain", value: label } : { kind: "root" };
  }

  // Anything else is a domain a reseller pointed at us (custom domain), OR the
  // legacy flagship domain (longevitypeptides.com) which is matched by
  // customDomain too, falling back to the env default brand if unmatched.
  return { kind: "customDomain", value: host };
}
