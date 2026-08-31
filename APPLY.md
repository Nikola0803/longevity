# Storefront network, technical notes

Deeper detail behind QUICKSTART.md, for when you're editing this code later.

## Files

| File | What it does |
| --- | --- |
| `src/lib/brand-resolver.ts` | Pure, edge-safe Host header parser (subdomain / custom domain / root). No DB, unit-testable. |
| `src/lib/store-context.ts` | Resolves the current Brand from the request host, memoised per request (`React.cache`). Same `{ organizationId, brandId }` return shape as before, so all pre-existing call sites are unaffected. |
| `src/lib/brand-theme.ts` | Turns `Brand.themeTokens` into a `:root,[data-theme]{...}` CSS-variable override. Allow-listed variable names only. |
| `src/lib/catalog.ts` | Per-brand pricing via `BrandProduct`, dual-mode: a brand with `BrandProduct` rows gets its own carried catalog + prices; a brand without any (the flagship, today) gets the old global-pricing behaviour untouched. |
| `src/lib/subdomain.ts` | Slugify, format validation, reserved-word list, live availability check. |
| `src/lib/store-url.ts` | Builds the public URL for a brand: custom domain if set, else `<subdomain>.<PLATFORM_ROOT_DOMAIN>` (or `.localhost:<port>` in dev). |
| `src/lib/provision.ts` | Provisions a new Brand: validates the subdomain/custom domain, creates the Brand, seeds its `BrandProduct` catalog at its markup, creates default tracking/shipping config, all in one `$transaction`. |
| `src/app/onboard/page.tsx` | The multistep onboarding UI. |
| `src/app/api/onboard/check-subdomain/route.ts` | Live availability check the onboarding UI calls while typing. |
| `src/app/api/onboard/create/route.ts` | Calls `provisionBrand()`, returns the live store URL. |
| `prisma/schema.prisma` | Adds `BrandProduct` + network fields (`subdomain`, `customDomain`, `templateId`, `themeTokens`, `plan`, `defaultMarkupBps`) on `Brand`. Additive only, every new column nullable or defaulted. |
| `prisma/seed-network-demo.ts` | Adds a second demo brand ("Aera") sharing the catalog, to prove pricing + theming both work per-brand. |
| `package.json` `predev` script | `prisma db push --skip-generate`, runs automatically before every `npm run dev`, so the live database schema can never silently drift from `schema.prisma` again. If this fails, it's a DB-connectivity problem (wrong `DATABASE_URL`, Postgres not running, or a port collision, see QUICKSTART.md), not a code problem, `prisma db push` will say so directly. |

## Why the flagship storefront is unaffected

- `getStoreContext()` returns the exact same shape it always did; every
  existing caller (20 call sites across blog, sitemap, auth, coupons,
  newsletter, order-engine, tracking) is unchanged.
- Catalog dual-mode: no `BrandProduct` rows means the exact old
  global-pricing path. Longevity Peptides only moves to per-brand pricing when you
  explicitly give it `BrandProduct` rows, on your schedule.
- Theme CSS only renders when a brand has `themeTokens` set.
- Every storefront page is already `export const dynamic = "force-dynamic"`,
  so resolving the host per request introduces no new caching/rendering
  behavior.
- Schema changes are additive and nullable and `db:push`, non-destructive.

## The domain resolution contract

This is the exact behavior the fallback promise (their domain, or
`name.oursite.com`) depends on, so if you touch either file, keep both sides
in sync:

- **Read side** (`store-context.ts`, runs on every request): custom domain
  match first, then subdomain match, then the env-default brand.
- **Write/display side** (`store-url.ts`, used right after onboarding and
  anywhere you show "your store is live at..."): same priority, custom
  domain if set, else the subdomain URL.

A brand's subdomain is set at creation and never removed, so the fallback
address is permanent, not just a pre-DNS placeholder.

## One route conflict fixed while packaging

The original zip had both `src/app/page.tsx` (redirecting `/` to
`/login`/`/dashboard`) and `src/app/(site)/page.tsx` (the storefront home
page) both resolving to the route `/`, which Next.js refuses to build
("two parallel pages"). Removed `src/app/page.tsx` so the storefront owns
`/` on brand hosts, the CRM stays reachable at `/login` and `/admin`
directly. If you want a marketing/root landing page at the bare platform
domain later (as opposed to any brand's storefront), that's a good use for
`brand-resolver.ts`'s `{ kind: "root" }` case, branch on it in `page.tsx`
before it falls through to the default brand.

## Deliberately not in this drop

- Wallet + settlement (auto-debit per order). Next build.
- `STORE_OPERATOR` scoped role, so `/admin` still shows everything; don't
  hand it to a reseller yet.
- Automated TLS for custom domains (deploy-time, Caddy on-demand TLS is the
  right tool, comes with VPS setup).

## Storefront frontend detached

The bundled buyer-facing storefront (the old `(site)` route group: product
pages, cart, checkout UI) is moved to `src/app/_storefront-detached/`. In
Next.js App Router, an underscore-prefixed folder is a "private folder",
excluded from routing entirely, so this is inert with zero risk of a route
collision, and kept only for reference. A confirmed-clean cut: nothing under
`/admin`, `/api`, or `src/lib` imports from it.

`src/app/page.tsx` (root `/`) was restored to its original behavior,
redirect to `/dashboard` if logged in, else `/login`, since the storefront no
longer claims that route.

The full headless API a replacement frontend needs already existed under
`/api/store/*` (products, checkout, coupons, shipping, buyer auth, orders,
newsletter, affiliate tracking, reviews), all of it independent of the
detached UI, all of it host-resolved through the same `getStoreContext()` /
`getCurrentBrand()` path as before. Added one endpoint that didn't exist,
`GET /api/store/brand` (`src/app/api/store/brand/route.ts`), which returns
the current store's name, `templateId`, and theme tokens/CSS, the identity
info a new frontend needs on load to know which store it's rendering and how
to skin itself. Same Host-header resolution as everything else, so it works
correctly the moment the new frontend forwards the right Host (or an
`x-forwarded-host`) through to this API.

If you reattach a storefront later (this one or a new one) as part of this
same Next app, rename `_storefront-detached` back to `(site)`, delete the
restored `src/app/page.tsx` again (it will collide with `(site)`'s own `/`
page), and remove the "storefront: detached" line from this file. If instead
you keep it permanently external (recommended, given the multi-template
onboarding direction), no further changes here are needed, `/api/store/*` is
the stable contract to build against.

## Duplicate route groups consolidated to /admin

The app shipped with two near-identical copies of the entire CRM: a root
`(app)` route group (`/dashboard`, `/orders`, ...) and `admin/(app)`
(`/admin/dashboard`, `/admin/orders`, ...). They rendered the same shared
`Sidebar` component, but every link in `NAV_GROUPS` (`src/lib/nav.ts`) was
hardcoded to `/admin/...`, so navigating from the root copy always bounced
you into the admin copy, regardless of which one you started on or logged
into. `admin/(app)` was also strictly ahead, 9 pages (content/CMS, invoices,
order/product detail, support) existed there and nowhere else, confirming
root `(app)` was dead, superseded code, not a second real feature.

Fix: root `(app)` moved to `src/app/_app-legacy-detached` (inert, same
underscore-private-folder technique as the storefront detach). The plain
`/login` page moved to `src/app/_login-legacy-detached` for the same reason,
it pushed to the now-gone `/dashboard` on success, dead code left live would
have been an active dead end. `src/app/page.tsx` now redirects straight to
`/admin/dashboard` (logged in) or `/admin/login` (not), matching
`authOptions.pages.signIn`, which was already `/admin/login`. There is now
exactly one CRM area, at `/admin/*`, matching what the nav already assumed.

## New: Brands & Resellers page (`/admin/brands`)

Previously, nothing in the admin nav showed which brands were connected, how
(hosted network store vs WooCommerce plugin), or their live URL. The data
existed (`Brand`, `BrandProduct`, `StoreMapping`), there was just no view of
it beyond a small card on the dashboard. `src/app/admin/(app)/brands/page.tsx`
groups every brand into: hosted network stores (has `BrandProduct` rows,
shows its live URL via `storeUrl()`, template, SKU count), WooCommerce
plugin-connected (has `StoreMapping` rows but no `BrandProduct` rows), and
not-yet-integrated (neither). Nav entry added in `src/lib/nav.ts` right
after Dashboard.

