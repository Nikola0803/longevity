# NiftiPay for WooCommerce

A WooCommerce Payment Gateway plugin for [NiftiPay](https://www.niftipay.com)'s
fiat (card) order API. NiftiPay processes the card charge on a hosted page;
WooCommerce stays the system of record — orders, stock, refunds, customer
accounts all live in WooCommerce as normal. Built for the headless setup
where the storefront (Next.js) never talks to NiftiPay directly — checkout
posts to WooCommerce (via its REST API or `wc-ajax` checkout), WooCommerce
redirects to NiftiPay's `payUrl`, and NiftiPay's webhook reports back to
WordPress, not to the Next.js app.

## How it works

1. Customer completes checkout → a WooCommerce order is created (`pending payment`).
2. This plugin's `process_payment()` calls `POST /api/fiat/orders` with the
   order total, currency, and the WooCommerce order ID as `reference`, then
   redirects the customer to NiftiPay's returned `payUrl`.
3. The order is set to **On hold** while payment is in progress. Stock is
   held, not deducted, until payment is confirmed.
4. Customer pays by card on NiftiPay's page, then is redirected back to
   WooCommerce's order-received page — **this redirect is UI-only** and
   never marks the order paid (per NiftiPay's own integration guidance).
5. NiftiPay's webhook (`POST https://<your-site>/niftipay/webhook`) is what
   actually confirms payment. This plugin listens on that exact path and
   transitions the order: `paid`/`completed` → Processing, `cancelled` →
   Cancelled, `refunded` → Refunded.
6. Refunds issued from the WooCommerce Orders screen call NiftiPay's
   `POST /api/fiat/orders/:orderKey/refunds` (supports partial refunds).

## Install

1. Zip the `niftipay-woocommerce/` folder, or copy it directly into
   `wp-content/plugins/` on the WordPress site.
2. WordPress Admin → Plugins → activate **NiftiPay for WooCommerce**.
3. WooCommerce → Settings → Payments → **NiftiPay (Card)** → Manage.
4. Paste your **API key** (Dashboard → Settings → API Keys on niftipay.com).
   This is a live secret — it's stored in WordPress's own database
   (`wp_options`, table-level, not in any file), same as your other
   WooCommerce payment gateway keys. Never commit it to git.
5. **Integration ID**: this store already has one created on the NiftiPay
   side —

   | Field | Value |
   |---|---|
   | Name | Woocommerce |
   | Integration ID | `fed42465-0f5d-441d-ad03-5e1c18b3b99e` |
   | Return URL | `https://longevitytech-lab.com/checkout/order-received/` |
   | Merchant webhook URL | `https://longevitytech-lab.com/niftipay/webhook` |

   Paste that Integration ID into the settings field directly — do **not**
   use the "Auto-create integration" button (that's only for a fresh setup
   with no integration yet, and would create a second, redundant one).
6. Confirm the **Webhook URL** shown read-only in settings matches
   `https://longevitytech-lab.com/niftipay/webhook` exactly (it's derived
   from `home_url()`, so it will unless the site is on a different domain
   than expected — double check if so).
7. Save changes.

## ⚠️ Before accepting real payments

**Webhook signature verification is a stub**, not fully wired — see the
`TODO` in `includes/class-niftipay-webhook.php`'s `verify_signature()`.
The NiftiPay docs reference `x-signature`/`x-timestamp` headers as part of
their CORS allowlist and say "always verify signatures if enabled for your
webhook," but the exact HMAC construction wasn't in the documentation we
integrated against. **Confirm the signing scheme with NiftiPay support**
and fill in `verify_signature()` before this handles real money — right
now every webhook call is accepted and logged with a warning, not rejected,
so the integration works end-to-end but isn't yet hardened against a
forged webhook call hitting a public URL. Every webhook payload is logged
to WooCommerce → Status → Logs → `niftipay` regardless, so you can audit
what's actually been received once the site goes live.

## Files

- `niftipay-woocommerce.php` — plugin bootstrap, registers the gateway with WooCommerce, HPOS compatibility declaration.
- `includes/class-niftipay-api-client.php` — thin REST client for NiftiPay's fiat orders/integrations/refunds endpoints.
- `includes/class-wc-gateway-niftipay.php` — the `WC_Payment_Gateway` implementation: checkout redirect, admin settings, refunds.
- `includes/class-niftipay-webhook.php` — the `/niftipay/webhook` receiver and order-status reconciliation.

## Currency support

`WC_Gateway_Niftipay::to_minor_units()` handles 0-, 2-, and 3-decimal
currencies (JPY-style, standard, and BHD/KWD/OMR-style respectively) per
NiftiPay's "Currency minor unit rules." This store trades in AUD (2
decimals) — no changes needed there, but check that list if the store ever
adds a market outside it.
