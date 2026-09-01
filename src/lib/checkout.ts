/**
 * WooCommerce Store API checkout — runs directly in the browser now (this
 * is a static Vite SPA with no Node server of its own), calling the
 * WordPress site's Store API cross-origin. This is what makes checkout
 * REAL: Store API is what WooCommerce Blocks' own checkout uses
 * internally — it runs the actual checkout pipeline (creates the order AND
 * calls the chosen payment gateway's process_payment()) and hands back the
 * NiftiPay plugin's redirect URL (payUrl), exactly as if a shopper had
 * checked out on woocommerce.com's own checkout page.
 *
 * Cross-origin requirement: the browser needs `credentials: "include"` to
 * carry the Woo session cookie, which means the WordPress site must send
 * CORS headers back — Access-Control-Allow-Origin set to this storefront's
 * exact origin (not "*", which is incompatible with credentialed
 * requests), Access-Control-Allow-Credentials: true, and
 * Access-Control-Expose-Headers including the nonce header so this code
 * can read it. See wordpress-plugin/longevity-content-manager's CORS setup
 * (class-cors.php) — it reads the allowed origin from the same
 * `storefront_url` setting the NiftiPay plugin already exposes.
 */

const WOO_STORE_URL = (import.meta.env.VITE_WOO_STORE_URL as string | undefined)?.replace(/\/$/, "");

interface StoreApiResult {
  res: Response;
  data: unknown;
  nonce: string | null;
}

async function storeApiFetch(
  path: string,
  init: { method?: string; body?: unknown; nonce?: string | null } = {},
): Promise<StoreApiResult> {
  if (!WOO_STORE_URL) {
    throw new Error("VITE_WOO_STORE_URL is not configured");
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.nonce) headers["Nonce"] = init.nonce;

  let body: string | undefined;
  if (init.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.body);
  }

  const res = await fetch(`${WOO_STORE_URL}/wp-json/wc/store/v1${path}`, {
    method: init.method ?? "GET",
    headers,
    body,
    credentials: "include",
  });

  const nonce = res.headers.get("x-wc-store-api-nonce") ?? res.headers.get("nonce");

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  return { res, data, nonce };
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
  if (!WOO_STORE_URL) {
    return { ok: false, error: "Checkout isn't connected to WooCommerce yet (VITE_WOO_STORE_URL not configured)." };
  }
  if (!items.length) {
    return { ok: false, error: "Cart is empty." };
  }

  // 1. Open a cart session and get the initial nonce.
  const cartRes = await storeApiFetch("/cart");
  if (!cartRes.res.ok) {
    return { ok: false, error: "Could not reach the store to start checkout.", details: cartRes.data };
  }
  let nonce = cartRes.nonce;

  // 2. Add every line item.
  for (const item of items) {
    if (!item.wooProductId) {
      return {
        ok: false,
        error: "One or more items in your cart aren't linked to a live product yet — please refresh the shop and try again.",
      };
    }
    const addRes = await storeApiFetch("/cart/add-item", {
      method: "POST",
      nonce,
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
    if (addRes.nonce) nonce = addRes.nonce;
    if (!addRes.res.ok) {
      const err = (addRes.data as { message?: string })?.message ?? "Could not add an item to the cart.";
      return { ok: false, error: err, details: addRes.data };
    }
  }

  // 3. Submit checkout with the NiftiPay gateway selected. The gateway id
  // ("niftipay") must match WC_Gateway_Niftipay::$id in the WordPress plugin.
  const checkoutRes = await storeApiFetch("/checkout", {
    method: "POST",
    nonce,
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
