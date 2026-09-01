=== Longevity Peptides COA Library ===
Contributors: longevitytechlab
Requires at least: 6.0
Requires PHP: 8.0
Version: 1.0.0
License: GPLv2 or later

Live, admin-editable Certificate of Analysis (COA) library for the
Longevity Peptides Next.js storefront.

== Description ==

Powers the storefront's COA verification pages:

- `/coa` — browse the full library
- `/verify/:lot` — public batch verification by lot/batch number
- Per-product COA lookup, keyed by product slug, for the newest batch of
  a given product

Extracted down to just the COA piece so this site isn't carrying
homepage/FAQ/blog/order-panel content management here too - see the
separate `longevity-content-manager` plugin for that.

== Endpoints ==

`GET /wp-json/longevity/v1/coas` (optional `?product=<slug>`),
`GET /wp-json/longevity/v1/coa-latest?product=<slug>`,
`GET /wp-json/longevity/v1/coa-lookup?lot=<lot>` — all public/read-only,
same `longevity/v1` REST namespace the `longevity-content-manager`
plugin's auth endpoints already use.

== Getting started ==

1. Activate the plugin.
2. Go to **COA Library** in wp-admin and add a COA per lab-tested batch
   (Product slug, Batch/Lot #, PDF URL, lab, dose, purity, test date).
   There is no bundled sample data - this is a fresh library for real
   Longevity Peptides batches only.
3. If this WordPress install's URL differs from the public storefront URL,
   set it under COA Library → Settings so QR codes point at the right
   place.
