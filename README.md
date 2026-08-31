# Vertalis × Longevity

Vertalis storefront (Next.js), light theme only, wired to a WooCommerce
product catalog (dose + pack-count variants) carried over from
longevity-peps.

## Origin

- **Design/UI**: ported from `nikola0803/novaryn`'s detached Vertalis
  storefront (`src/app/_storefront-detached`, `src/components-site`). Only
  the light palette survives — the dark theme, `ThemeToggle`, and the
  `[data-theme]` runtime switch were removed; `globals.css` now defines a
  single palette.
- **Product data**: `nikola0803/longevity-peps` sold through WooCommerce via
  Lovable.dev's proprietary connector gateway
  (`connector-gateway.lovable.dev`), which only works inside Lovable's own
  hosting. This app instead talks to **standard WooCommerce REST API v3**
  directly (`src/lib/woo.ts`) using your store's own consumer key/secret —
  see `.env.example`. If Woo is unreachable or unconfigured, the site falls
  back to a hardcoded catalog (`src/data/products.ts`) so the shop is never
  empty.

## Variants

Each product can have:
- **Dose variants** (e.g. BPC-157 5mg vs 10mg) — separate `Product` entries
  sharing the same `name`.
- **Pack variants** (1x vs 10x of the same dose) — `product.packs`, an array
  of `{ qty, price }`. The product card lets shoppers pick dose, then pack.

`src/lib/woo.ts` groups WooCommerce variation attributes into dose + pack
automatically (looking for attributes matching `dose/size/spec` and
`pack/qty/quantity`); products with no matching attributes get a synthetic
1x/10x ladder via `defaultPacks()`.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in WOO_* to go live, or leave unset for the fallback catalog
npm run dev
```

## Not yet ported from novaryn (next steps)

- Checkout flow, CoA lookup/verify pages, quiz, affiliate tracking, blog,
  FAQ — the detached storefront has these; this repo only ports the shop
  core (home, shop, product, cart, about, contact, legal).
- Real product photography — currently a placeholder image; swap in actual
  longevity-peps assets or your Woo product images once Woo is connected.
- Verify the real longevity-peps dose/pack WooCommerce attribute names
  against `src/lib/woo.ts`'s regex matching and adjust if they differ.
- Pricing in `src/data/products.ts` is placeholder — replace once Woo is
  wired up.
