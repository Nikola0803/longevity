# Longevity Peptides Storefront

A Vite + React SPA storefront for Longevity Peptides, backed by a headless
WordPress/WooCommerce install (catalog, checkout, CMS content, COAs) and
NiftiPay for payment processing. Ships to Australia and New Zealand only.

## Stack

- **`/src`** — React 18 + TypeScript + Tailwind, routed with
  `react-router-dom`. No server component of its own — every page fetches
  data directly from the browser (WooCommerce's public Store API, and the
  two WordPress plugins below), same as any client-rendered SPA.
- **`/wordpress-plugin/longevity-content-manager`** — editable site copy
  (CMS), headless account auth, guest-order linking, marketing, and
  WooCommerce product-data tools, plus the optional built-in SPA
  router/uploader described below.
- **`/wordpress-plugin/longevity-coa-library`** — admin-editable
  Certificates of Analysis, one post per lab-tested batch.
- **`/wordpress-plugin/niftipay-woocommerce`** — the NiftiPay payment
  gateway for WooCommerce.

## Local setup

```bash
cp .env.example .env
# edit .env — VITE_WOO_STORE_URL (your WooCommerce site's URL)

npm install
npm run dev
```

Without `VITE_WOO_STORE_URL` set, the storefront still runs — it serves the
static fallback catalog in `src/data/products.ts` (real photos, no live
backend, no checkout).

## Building for production

```bash
npm run build
```

This produces `dist/` — a fully static bundle (`index.html` + fingerprinted
JS/CSS/font assets under `dist/assets/`). There is no Node server to deploy;
`dist/` is the entire deliverable.

**Two ways to serve it:**

1. **Any static host** (Vercel, Netlify, Cloudflare Pages, S3+CDN, etc.) —
   point it at `dist/`, with a catch-all rewrite to `index.html` for
   client-side routing (react-router handles the rest in the browser).
2. **Served directly by WordPress**, via the
   `longevity-content-manager` plugin's built-in uploader:
   1. `npm run build`
   2. `cd dist && zip -r ../storefront.zip . && cd ..` — zip the
      *contents* of `dist/`, not the folder itself (`index.html` must sit
      at the root of the zip).
   3. In wp-admin: **Longevity Peptides Content Manager** (top-level admin
      menu) → upload `storefront.zip`.
   4. Flip on **SPA takeover**. From then on, every request WordPress
      itself doesn't need (`/wp-admin`, `/wp-json`, `/wp-login.php`, etc.
      stay untouched) is answered with this build's `index.html`, and
      react-router takes it from there.
   Takeover stays off until explicitly enabled, so uploading a build never
   immediately changes the live site.

Either way, whichever domain ends up serving the storefront must be set as
the **storefront origin** in two places on the WordPress side, so checkout
and CORS work:
- WooCommerce → Payment Gateways → **NiftiPay** → Headless Storefront URL
- **Longevity Peptides Content Manager** → Site Settings → Storefront
  origin (CORS)

## How checkout actually works

There's no backend of this app's own to hide anything behind — every
request goes straight from the browser to WordPress:

- **Catalog**: WooCommerce's public Store API
  (`/wp-json/wc/store/v1/products`) — no auth needed, same endpoint a
  shopper's browser would hit loading any WooCommerce shop page.
- **Checkout**: also the Store API (`/cart`, `/cart/add-item`,
  `/checkout`), the same one WooCommerce Blocks' own checkout uses
  internally — it runs the real checkout pipeline and calls the NiftiPay
  gateway's `process_payment()`, returning NiftiPay's hosted payment URL
  for the browser to redirect to. Requires `credentials: "include"` on
  every request (to carry the Woo session cookie) and the WordPress site
  sending back matching CORS headers — see `class-cors.php` in the
  `longevity-content-manager` plugin.
- **CMS content, COAs**: the two custom plugins' own REST routes under
  `/wp-json/longevity/v1/*`.

## Known gaps

- **Live-Woo variation splitting**: dose/pack-size splitting (single vial
  vs 10-pack kit) is fully built and demonstrated against the static
  fallback catalog. For a *live* WooCommerce catalog, Store API's
  product-list endpoint doesn't reliably expose a variable product's
  per-variation breakdown the same way the old wc/v3 REST API did — this
  needs verifying against a real store before variable products come
  through as anything but simple products.
- **NiftiPay webhook signature verification** is a stub in the plugin
  (`class-niftipay-webhook.php`) pending confirmation of NiftiPay's exact
  HMAC scheme.
- **Per-page SEO** (meta tags, JSON-LD) isn't wired up beyond the static
  tags in `index.html` — this is a client-rendered SPA, so search-engine
  visibility is inherently weaker than a server-rendered site; add
  `react-helmet-async` (or similar) if per-route meta tags matter.
