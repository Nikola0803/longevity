# Longevity Peptides Storefront

A Vite + React SPA storefront for Longevity Peptides, backed by a headless
WordPress/WooCommerce install (catalog, checkout, CMS content, COAs) and
NiftiPay for payment processing. Ships to Australia and New Zealand only.

## Stack

- **`/src`** — React 18 + TypeScript + Tailwind, routed with
  `react-router-dom`. No server component of its own — every page fetches
  data directly from the browser (the plugins' own REST routes for
  catalog/CMS/COAs, WooCommerce's Store API for checkout), same as any
  client-rendered SPA.
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

- **Catalog**: the `longevity-content-manager` plugin's own
  `/wp-json/longevity/v1/catalog` endpoint (public, no auth) — built
  directly off WooCommerce's PHP product objects on the server
  (`class-catalog-api.php`), not the Store API, so it can guarantee full
  dose + pack-size variation data in the exact shape the frontend expects.
- **Checkout**: the Store API (`/cart`, `/cart/add-item`,
  `/checkout`), the same one WooCommerce Blocks' own checkout uses
  internally — it runs the real checkout pipeline and calls the NiftiPay
  gateway's `process_payment()`, returning NiftiPay's hosted payment URL
  for the browser to redirect to. Requires `credentials: "include"` on
  every request (to carry the Woo session cookie) and the WordPress site
  sending back matching CORS headers — see `class-cors.php` in the
  `longevity-content-manager` plugin.
- **CMS content, COAs**: the two custom plugins' own REST routes under
  `/wp-json/longevity/v1/*`.

## Importing your product catalog

Don't use wp-admin's own **Products → Import** for a real catalog-sized
CSV — it downloads every product image synchronously per row and routinely
times out on shared hosting. Use **Longevity Peptides Content Manager →
Import Products** instead (in the `longevity-content-manager` plugin): it
writes products directly through WooCommerce's PHP API, maps categories
into this site's own taxonomy automatically, and tags any product named
`<Compound> Kit` as a 10-vial pack (`_lpcm_pack_size` = 10) with zero extra
steps — the exact signal `getAllCatalogProducts()` needs to show the
single-vial/10-pack selector on a real product. Safe to re-run against the
same file; products are matched and updated by slug, never duplicated.

## Known gaps

- **NiftiPay webhook signature verification** is a stub in the plugin
  (`class-niftipay-webhook.php`) pending confirmation of NiftiPay's exact
  HMAC scheme.
- **Per-page SEO** (meta tags, JSON-LD) isn't wired up beyond the static
  tags in `index.html` — this is a client-rendered SPA, so search-engine
  visibility is inherently weaker than a server-rendered site; add
  `react-helmet-async` (or similar) if per-route meta tags matter.
