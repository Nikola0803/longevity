import "server-only";

/**
 * WooCommerce Store API bridge — this is what actually makes the headless
 * Next.js checkout a REAL checkout instead of a stub. Unlike wc/v3 (REST
 * API, used read-only elsewhere in this app for the product catalog), the
 * Store API is what WooCommerce Blocks' own checkout uses internally: it
 * runs the real checkout pipeline — creates the order AND calls the chosen
 * payment gateway's process_payment() — so calling it here gets us the
 * NiftiPay plugin's redirect URL (payUrl) back, exactly as if a shopper had
 * checked out on woocommerce.com's own checkout page.
 *
 * wc/v3 (used in storefront-catalog.ts) cannot do this — it only creates an
 * order *record*, it never runs gateway processing, so it can't produce a
 * payment redirect on its own.
 *
 * No consumer key/secret needed here — the Store API is the same public,
 * session-based API a browser hitting the WooCommerce site directly would
 * use. We stand in for that browser for exactly one checkout request span:
 * open a session (GET /cart), add items, submit checkout, done. Nothing is
 * persisted across separate HTTP requests to our own Next.js server —
 * each checkout submission builds and tears down its own Woo cart session.
 */

interface WooSession {
  cookies: string[];
  nonce: string | null;
}

function baseUrl(): string {
  const url = process.env.WOO_STORE_URL;
  if (!url) throw new Error("WOO_STORE_URL is not configured");
  return url.replace(/\/$/, "");
}

function collectSetCookies(res: Response): string[] {
  // Node's fetch/Headers folds multiple Set-Cookie into one header in some
  // runtimes; getSetCookie() (Node 18.14+/undici) is the reliable path.
  const anyHeaders = res.headers as unknown as { getSetCookie?: () => string[] };
  if (typeof anyHeaders.getSetCookie === "function") {
    return anyHeaders.getSetCookie();
  }
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

function mergeCookies(existing: string[], incoming: string[]): string[] {
  // Keep it simple: replace any cookie with the same name, append new ones.
  const byName = new Map<string, string>();
  for (const c of [...existing, ...incoming]) {
    const [pair] = c.split(";");
    const name = pair.split("=")[0]?.trim();
    if (name) byName.set(name, pair.trim());
  }
  return Array.from(byName.values());
}

async function storeApiFetch(
  session: WooSession,
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<{ res: Response; data: unknown }> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (session.cookies.length) headers.Cookie = session.cookies.join("; ");
  if (session.nonce) headers["Nonce"] = session.nonce;

  let body: string | undefined;
  if (init.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.body);
  }

  const res = await fetch(`${baseUrl()}/wp-json/wc/store/v1${path}`, {
    method: init.method ?? "GET",
    headers,
    body,
    cache: "no-store",
  });

  session.cookies = mergeCookies(session.cookies, collectSetCookies(res));
  const nonce = res.headers.get("x-wc-store-api-nonce") ?? res.headers.get("nonce");
  if (nonce) session.nonce = nonce;

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  return { res, data };
}

export interface WooCheckoutItem {
  wooProductId: number;
  wooVariationId?: number;
  qty: number;
}

export interface WooBillingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_1: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface WooCheckoutResult {
  ok: boolean;
  redirectUrl?: string;
  orderId?: number;
  error?: string;
  details?: unknown;
}

/**
 * Adds every cart item to a fresh WooCommerce session, then submits
 * checkout with the NiftiPay gateway selected. Returns the redirect URL
 * (NiftiPay's payUrl) the browser should be sent to next.
 */
export async function wooHeadlessCheckout(
  items: WooCheckoutItem[],
  billing: WooBillingAddress,
  customerNote?: string,
): Promise<WooCheckoutResult> {
  if (!items.length) {
    return { ok: false, error: "Cart is empty." };
  }

  const session: WooSession = { cookies: [], nonce: null };

  // 1. Open a cart session and get the initial nonce.
  const cartRes = await storeApiFetch(session, "/cart");
  if (!cartRes.res.ok) {
    return { ok: false, error: "Could not reach the store to start checkout.", details: cartRes.data };
  }

  // 2. Add every line item.
  for (const item of items) {
    if (!item.wooProductId) {
      return {
        ok: false,
        error: "One or more items in your cart aren't linked to a live product yet — please refresh the shop and try again.",
      };
    }
    const addRes = await storeApiFetch(session, "/cart/add-item", {
      method: "POST",
      body: {
        // WooCommerce treats a product variation as its own product id for
        // add-to-cart purposes, so this is a single `id`, not a separate
        // variation-attribute payload. If your store's Store API version
        // instead expects `{ id: <parent id>, variation: [...] }` for
        // variable products, swap this line for that shape.
        id: item.wooVariationId ?? item.wooProductId,
        quantity: item.qty,
      },
    });
    if (!addRes.res.ok) {
      const err = (addRes.data as { message?: string })?.message ?? "Could not add an item to the cart.";
      return { ok: false, error: err, details: addRes.data };
    }
  }

  // 3. Submit checkout with the NiftiPay gateway selected. The gateway id
  // ("niftipay") must match WC_Gateway_Niftipay::$id in the WordPress plugin.
  const checkoutRes = await storeApiFetch(session, "/checkout", {
    method: "POST",
    body: {
      billing_address: { ...billing, address_2: "" },
      shipping_address: { ...billing, address_2: "" },
      payment_method: "niftipay",
      customer_note: customerNote ?? "",
    },
  });

  const checkoutData = checkoutRes.data as {
    order_id?: number;
    payment_result?: { payment_status?: string; redirect_url?: string };
    message?: string;
  } | null;

  if (!checkoutRes.res.ok || !checkoutData) {
    return {
      ok: false,
      error: checkoutData?.message ?? "Checkout could not be completed. Please try again.",
      details: checkoutData,
    };
  }

  const redirectUrl = checkoutData.payment_result?.redirect_url;
  if (!redirectUrl) {
    return {
      ok: false,
      error: "Payment could not be started — no redirect returned by the store.",
      details: checkoutData,
    };
  }

  return { ok: true, redirectUrl, orderId: checkoutData.order_id };
}
