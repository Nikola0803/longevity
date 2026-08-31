# Peptide Command Center

A multi-brand CRM/command-center for a network of WooCommerce peptide
stores, rebuilt from a readdy.ai design mockup into a real, multi-tenant
Next.js SaaS with a companion WordPress plugin.

## What's here

- **`/src`** — Next.js 14 (App Router) + TypeScript + Tailwind app.
  Multi-tenant from the schema up (`Organization` → `Brand` →
  products/orders/contacts/affiliates), so it works both as an internal
  tool and as something you resell to other store owners.
- **`/prisma/schema.prisma`** — the full data model.
- **`/prisma/seed.ts`** — demo data (3 brands, sample orders/contacts/
  affiliates) matching the original mockup, so you can click through a
  populated dashboard immediately.
- **`/wp-plugin/command-center-connector`** — the WordPress plugin.
  Installed on each brand's WooCommerce site, it:
  1. **Self-registers the site** as a new Brand using your org's API key
     (Settings → Command Center in WP admin) — this is the "automatic
     recognition of new websites": no manual step in the dashboard.
  2. **Auto-configures native WooCommerce webhooks** (order.created,
     order.updated) pointed at your Command Center, signed the same way
     WooCommerce signs any webhook (`X-WC-Webhook-Signature`).
  3. **Backfills existing products & orders** on first connect, and again
     on a twice-daily cron job as a reconciliation safety net — this is
     the "auto sync".
- **`/scripts/build-plugin-zip.ts`** — zips the plugin into
  `public/downloads/command-center-connector.zip` on every build, so the
  in-app "Download WordPress plugin" button always serves the current
  version.

## Local setup

```bash
cp .env.example .env
# edit .env — DATABASE_URL, NEXTAUTH_SECRET (openssl rand -base64 32)

npm install
npm run db:push      # creates tables from schema.prisma
npm run db:seed      # demo org + brands + orders
npm run dev
```

Sign in with the seeded demo account: `operator@example.com` /
`password123`.

## Database hosting

The schema is plain PostgreSQL — no Supabase-specific features — so either
of these work with zero schema changes:

- **Vercel Postgres (Neon-backed)** — simplest if the app itself is on
  Vercel; connection pooling for serverless functions is handled for you.
- **Self-hosted Postgres on your own VPS** (same pattern as Mashiach
  Tech) — cheaper at scale, but since Next.js API routes are
  short-lived, put **PgBouncer** (or Prisma's built-in connection
  pooling via `?pgbouncer=true` on the URL, or Prisma Accelerate) in
  front of it, or you'll exhaust Postgres connections under load. If
  you're not planning heavy concurrent traffic soon, a direct connection
  is fine to start and pooling can be added later without touching the
  schema.

## Connecting a WooCommerce store

1. Deploy this app somewhere reachable over HTTPS (webhooks need a real
   URL — `localhost` won't work for a live store).
2. Sign in, go to **Webhooks**, copy the **Organization API key**.
3. Download and install `command-center-connector.zip` on the
   WooCommerce site.
4. In WP admin: **Settings → Command Center** → paste the Command Center
   URL + API key → **Connect this site**.

The new brand appears on the Webhooks/Dashboard pages within seconds.

## What's NOT built yet

- **Multi-org signup/onboarding flow.** Right now organizations only
  exist via the seed script or direct DB inserts — there's no public
  "create your account" page. Needed before this can actually be sold.
- **Billing** (Stripe subscriptions tied to `Organization.plan`).
- **Variable-product / variation support** in the plugin's product sync
  (currently simple products only, matched by SKU).
- **Order edits/refunds after the fact** — the webhook handler upserts an
  order's status and totals on re-delivery, but doesn't currently re-diff
  line items, so a partial refund that changes quantities won't be
  reflected in `OrderItem` rows.
- **Shipping, Payments, Email Marketing, Social Analytics, AI Blog Tool,
  Reddit Marketing, Tracking & Pixels** — these pages exist as
  placeholders with a description of what they'll do, matching the
  mockup's structure, but have no logic behind them yet.
- **Real merchant fee configuration** — the profit calculation assumes a
  flat 2.9% + $0.30 processor fee; make this configurable per brand
  before trusting the net profit numbers.
- **Team invitations** — `Membership`/`Role` exist in the schema, but
  there's no UI to invite a second user into an organization yet.
