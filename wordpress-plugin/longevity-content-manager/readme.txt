=== Longevity Peptides Content Manager ===
Contributors: longevitytechlab
Requires at least: 6.0
Requires PHP: 8.0
Version: 2.2.0
License: GPLv2 or later

Headless CMS, auth, marketing and product-data tools for the Longevity
Peptides storefront - a Next.js app hosted separately (e.g. Vercel), not
served by this plugin, talking to this WordPress/WooCommerce install
purely over REST.

== Description ==

This is the "manage everything in wp-admin" plugin: editable copy for
every marketing page (home, about, contact, FAQ, shop, COA, legal,
footer), headless account auth, guest-order-to-account linking, an
Omnisend marketing opt-in sync, site-wide settings, and WooCommerce
product/image bulk-management tools. It does **not** manage the product
catalog itself (that's WooCommerce + the NiftiPay payment plugin) or COA
records (that's the separate `longevity-coa-library` plugin) - just the
editorial copy and admin conveniences that have no other home.

== Content (CMS) ==

**Longevity Peptides Content Manager → Content (CMS)** — edits the hero
text, About/FAQ/Contact/Shop/COA page copy, testimonials, footer links,
and legal page bodies shown across the site, and exposes it over REST at
`/wp-json/longevity/v1/cms` (and `/cms/{page}`) for the Next.js frontend
to read. Full field-by-field contract in `CMS_CONTENT_MODEL.md`.

The shipped defaults are written for Longevity Peptides' actual AU/NZ
market (TGA references, not FDA; NiftiPay card checkout, not
Zelle/Cash App/Venmo) - they're real starting copy, not lorem ipsum, but
still worth reading through and adjusting in wp-admin (phone number,
address, testimonials) before going live.

== Auth endpoints ==

`/wp-json/longevity/v1/register`, `/login`, `/validate` - simple
HMAC-signed token auth for the headless frontend (not WordPress cookie
auth), signed with the site's own `AUTH_KEY`. Also handles linking any
guest-checkout WooCommerce orders to an account automatically on
login/registration, with a one-off admin sweep for orders placed before
this was installed (**Longevity Peptides Content Manager → Guest Order
Linking**).

== Marketing ==

**Longevity Peptides Content Manager → Marketing** - stores an Omnisend
API key (Contacts scope) and pushes a subscribed contact whenever someone
opts in at account creation.

== Site Settings ==

**Longevity Peptides Content Manager → Site Settings** - currently just
the free-shipping cart threshold, read by the frontend at
`/wp-json/longevity/v1/settings`.

== Product tools ==

**Longevity Peptides Content Manager → Product Tools** carries three
generic WooCommerce data-entry helpers: **Bulk Create Missing Products**
(from a `slug|Name|price` list), **Product Tabs CSV Import** (writes COA
images + description text into product meta, exposed over the
WooCommerce REST API under `_lpcm_*` keys for the frontend to read), and
a **Product Image** sync tool (`slug|image-url` list). All three ship
empty by default - populate them via the `lpcm_product_tab_data` /
`lpcm_default_product_images` filters (e.g. from a small site-specific
mu-plugin) or just paste values into the textareas each time.

== Optional built-in SPA router ==

This plugin also carries an inactive-by-default static-file router and
zip-upload admin page (**Longevity Peptides Content Manager** top-level
menu) that can serve a built Vite/CRA `dist/` folder directly from this
WordPress install, with an explicit "SPA takeover" on/off switch. It is
**not used** by the current Next.js deployment (which is hosted on its
own domain and never needs WordPress to serve its frontend) - it only
matters if this WordPress install ever needs to serve the storefront
itself instead. Takeover stays off until explicitly enabled, so its
presence has no effect on the live site either way.

Reserved paths (`/wp-admin`, `/wp-json`, `/wp-login.php`, etc.) are never
handled by the router even when takeover is on; extend the list via the
`lpcm_reserved_prefixes` filter. GA4/GTM/verification tags for that mode
are set via `LPCM_GA4_ID` / `LPCM_GTM_ID` / `LPCM_SITE_VERIFICATION` in
wp-config.php.

== Where this plugin came from ==

Rebranded and adapted from a prior client project's CMS/router plugin -
renamed throughout, the REST namespace moved to `longevity/v1`, the old
site's hardcoded product data and manual Zelle/Cash App/Venmo
"Pending Payments" admin panel removed (NiftiPay's webhook confirms
payment automatically), and every default content string rewritten for
Longevity Peptides' own AU/NZ market instead of the original site's US
copy.
