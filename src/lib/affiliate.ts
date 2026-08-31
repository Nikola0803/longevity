/**
 * Client-side referral-link tracking for the Vertalis Affiliates program.
 *
 * A visitor who arrives via an affiliate's link (?ref=CODE) gets a 30-day
 * cookie stamped with that code, matching the vp-affiliates plugin's
 * cookie_days default (see vp_aff_get_settings() in vp-affiliates.php —
 * "the frontend cookie is fixed at 30 days per the affiliate program
 * policy," which is exactly what this file enforces).
 *
 * Whenever real checkout -> WooCommerce order creation is wired up, that
 * code should call getReferralCode() here and send the result as the new
 * order's `affiliate_ref` meta (plus `storefront: "vertalis"` meta) — see
 * vp_aff_attribute_order() in vp-affiliates.php for exactly what it reads.
 * Until then, this cookie is captured and pinged to the plugin for click
 * analytics, but nothing yet stamps it onto an order.
 *
 * NOTE: this replaces an earlier, unused "GoAffPro-style" localStorage
 * scaffold (dcode key) that was never wired into the app anywhere (no
 * imports found repo-wide) and didn't match the actual plugin's contract —
 * that groundwork is superseded by this file.
 */

const COOKIE_NAME = "vp_ref";
const COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Reads the stored referral code, if any (e.g. for stamping onto an order at checkout). */
export function getReferralCode(): string | null {
  return readCookie(COOKIE_NAME);
}

/**
 * Call once per page load (see components/AffiliateTracker.tsx). If the
 * current URL carries a ?ref= param, stores it — uppercased, matching how
 * the plugin stores and matches ref_code — and fires a non-blocking
 * click-tracking beacon. Safe to call on every navigation; a no-op when
 * there's no ?ref= param.
 */
export function captureReferral(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (!ref) return;

  const code = ref.trim().toUpperCase();
  if (!code) return;

  setCookie(COOKIE_NAME, code, COOKIE_DAYS);

  fetch("/api/affiliate/track-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ref_code: code,
      landing_url: window.location.pathname + window.location.search,
    }),
    keepalive: true,
  }).catch(() => {
    /* best-effort — a failed click ping shouldn't affect the visitor */
  });
}
