# Peptide Command Center, quickstart

Unzip, install, run. This zip is the CRM/CMS backend, the network/pricing
spine, reseller onboarding, and a headless `/api/store/*` API. The buyer-
facing storefront UI is detached (see "Storefront frontend" below), a
separate frontend now consumes this app over the API.

## 1. Requirements

- Node.js 20+ (built and tested against Node 22)
- PostgreSQL, installed locally (no Docker needed, no external hosted DB).

### Installing Postgres on Windows (one time, ~5 minutes)

1. Download the installer from
   https://www.postgresql.org/download/windows/ (the EDB installer, it's the
   standard one, includes pgAdmin).
2. Run it. Keep every default EXCEPT the password prompt: when it asks for a
   password for the `postgres` superuser, enter exactly `vertalis`. That's
   the password already baked into this project's `.env`, matching it here
   means zero config after install.
3. Keep the default port, `5432`. Keep the default database, `postgres`,
   which the installer creates automatically, no extra step needed.
4. Finish the installer. Postgres now runs as a Windows service in the
   background and starts automatically on boot, nothing further to launch.

That's it, `DATABASE_URL="postgresql://postgres:vertalis@localhost:5432/postgres"`
in `.env` now points at a real, running database.

(If you ever do install Docker later, `docker-compose.yml` is still in this
zip and works as an alternative, but it's entirely optional, ignore it for
now.)

## 2. Install and run

```bash
unzip peptides-crm-app.zip
cd peptides-crm-app

npm install
npm run db:push       # first-time table creation
npm run db:seed       # seeds the flagship org, brand, and catalog
npm run db:seed:demo  # adds a second demo reseller brand ("Aera") to prove the network

npm run dev
```

`npm run dev` now runs `prisma db push` automatically first (see `predev` in
`package.json`), so the database schema stays in sync with `schema.prisma`
on every start, you shouldn't need to think about this again.

**If you still see `The column "X" does not exist in the current database`:**
that auto-sync itself failed to reach Postgres. Check, in order:
- Is Postgres actually running? Open Windows Services (`services.msc`), look
  for something named `postgresql-x64-...`, status should say "Running". If
  it's stopped, right-click, Start.
- Does `.env`'s `DATABASE_URL` password match what you set during install?
  If you used a different password than `vertalis`, either reinstall with
  `vertalis`, or edit `.env` to match the password you actually chose.
- Run `npx prisma db push` directly in the terminal (not via `npm run`) and
  read its own output, it states plainly whether it's a connection failure
  versus something else. A connection failure there means Postgres isn't
  reachable at all, fix that first before anything else will work.

Open:
- `http://localhost:3000`, redirects to `/admin/login` (or straight to
  `/admin/dashboard` if already signed in). There is exactly one CRM area,
  at `/admin/*`, an earlier duplicate copy at the bare `/dashboard` etc,
  which caused inconsistent navigation, has been removed, see APPLY.md.
- `http://localhost:3000/admin/login`, the CRM/CMS back office
  (`operator@vertalispeptides.com` / `password123`, from the seed).
- `http://localhost:3000/admin/brands`, every brand's real connection
  status, hosted network store vs WooCommerce plugin, live URL, SKU count,
  last synced. New, previously nothing in the nav showed this.
- `http://localhost:3000/onboard`, the reseller onboarding flow. Walk
  through it and it provisions a real, live-priced Brand, it shows up on
  `/admin/brands` immediately.
- `http://localhost:3000/api/store/brand`, `/api/store/products`, etc, the
  headless API. See section 4 below.

## 3. Storefront frontend: detached

The original bundled buyer-facing storefront (product pages, cart, checkout
UI) has been moved to `src/app/_storefront-detached/`. The underscore
prefix means Next.js excludes it from routing entirely, it's inert, kept
only for reference/reuse. Nothing in `/admin` or the API depends on it.

Your new frontend, whatever stack it's built in, talks to this app through
the headless endpoints under `/api/store/*`:

| Endpoint | Returns |
| --- | --- |
| `GET /api/store/brand` | The current store's identity: name, template choice, theme colors, canonical URL. Resolved from the request's Host header, same resolution every other storefront read uses. Call this first. |
| `GET /api/store/products` | This store's catalog at this store's prices (per-brand pricing if the brand has `BrandProduct` rows, else global pricing). |
| `GET /api/store/products/[slug]` | One product, same pricing rule. |
| `POST /api/store/checkout` | Places an order. |
| `POST /api/store/coupons/validate` | Coupon validation (enforces the wholesale price floor). |
| `GET /api/store/shipping-rates` | Shipping options/rates. |
| `POST /api/store/auth/register`, `POST /api/store/auth/login` | Buyer account auth. |
| `GET /api/store/account/orders` | A logged-in buyer's order history. |
| `POST /api/store/newsletter` | Email capture. |
| `POST /api/store/affiliate/track-click` | Affiliate click tracking. |
| `POST /api/store/reviews` | Product reviews. |

All of these resolve "which store" the same way: by the request's Host
header. However you deploy the new frontend, make sure the Host it's serving
on (or an `x-forwarded-host` you pass through) reaches this API unchanged,
same rule as before: custom domain first, then `<subdomain>.<PLATFORM_ROOT_DOMAIN>`,
with the subdomain always the guaranteed fallback (see `src/lib/store-context.ts`).

## 4. Reseller onboarding, with the domain fallback

`/onboard` still does the same thing as before, it walks a reseller through
name to address to optional custom domain to template/color to launch, and
actually provisions a live Brand:

- They can enter their own domain (e.g. `www.theirbrand.com`). If they do,
  once they point its DNS at your platform, that's what customers see.
- If they leave it blank, or before their DNS propagates, the store is
  already live at `their-name.oursite.com`, permanently, not a placeholder.
- This resolution order is enforced in `src/lib/store-context.ts` on every
  API request, and mirrored in `src/lib/store-url.ts` for what's shown to
  the reseller after launch.

`templateId` is captured at onboarding and returned from `/api/store/brand`,
so your new frontend can pick which template/layout to render per store.

## 5. Config you'll actually touch

In `.env`:

```
PLATFORM_ROOT_DOMAIN=""              # your real domain in prod, e.g. "oursite.com"
NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN="localhost:3000"   # same, but what the onboarding UI shows
PLATFORM_ORG_SLUG="vertalis"         # which org's catalog resellers sell
```

## 6. Everything else (unchanged)

See `README.md` for the full original app documentation (WordPress plugin,
webhooks, admin CRM, VPS deploy notes) and `APPLY.md` for the deeper
technical writeup of the network/onboarding/detach changes.

## 7. Deliberately not in this drop

- **Wallet + settlement** (auto-debit a reseller's balance per order). Next
  build.
- **Scoped reseller login** (`STORE_OPERATOR` role, a locked-down back office
  a reseller can safely log into). Onboarding provisions the store but not
  yet a reseller-facing login, still admin-only. Do not hand `/admin` to a
  customer before this lands.
- **Automated TLS for custom domains.** `customDomain` is stored and
  resolved the moment it's set; issuing a certificate for it automatically
  (Caddy on-demand TLS is the right tool) is a deploy-time piece, comes with
  the VPS setup.
- **The new frontend itself.** Not part of this zip, build/plug in separately
  against `/api/store/*`.
