# Longevity Content Manager — CMS Content Model

Backend-only content-management extension to `longevity-content-manager`, implemented in
`includes/class-cms.php`. Lets wp-admin edit the marketing copy that today is
hardcoded in the React source, and exposes it over REST for the frontend to
consume in a later phase.

**Not covered by this system:** blog posts (native WP Posts /
`wp/v2/posts`), and product/COA data (WooCommerce + `class-product-tools.php`
/ `longevity-coa-library`).

## Image fields

Four fields are images, not copy: `home.quality.image_url`,
`about.hero.image_url`, `about.brand_story.image_url`,
`about.service_cta.image_url`. Each is a plain string holding a media
library URL - edited in wp-admin via a "Choose Image" button that opens
WordPress's own media library (`wp.media()`, core, no custom upload code),
not a raw text field. Sanitized with `esc_url_raw()` on save (every other
string field uses `sanitize_textarea_field()`). Default value is `""`; the
frontend falls back to its built-in placeholder graphic when empty, and
switches to the chosen photo once one is set.

## Storage

One WP option per page, autoload off, holding a plain PHP associative array
(serialized by WP core):

| Option name | Page key |
|---|---|
| `lpcm_cms_home` | `home` |
| `lpcm_cms_about` | `about` |
| `lpcm_cms_contact` | `contact` |
| `lpcm_cms_faq` | `faq` |
| `lpcm_cms_shop` | `shop` |
| `lpcm_cms_coa` | `coa` |
| `lpcm_cms_legal` | `legal` |
| `lpcm_cms_footer` | `footer` |

A fresh install has none of these options set. `GET` routes always return a
complete bundle: stored data is deep-merged on top of hardcoded defaults
(`LPCM_CMS::get_defaults()`), so any field an admin hasn't touched yet
falls back to the copy that was live in `src/` when this shipped. For
`legal`, the four `body` fields default to `''` (see the Legal section below
— left blank intentionally, not an accident).

## REST API

Namespace: `longevity/v1` (existing namespace this plugin already uses for
`/register`, `/login`, `/validate`).

### `GET /wp-json/longevity/v1/cms`

Public, no auth. Returns all 8 bundles keyed by page.

```json
{
  "home":    { "hero": { ... }, "quality": { ... }, "bento": { ... }, "feature_cards": { ... }, "testimonials": { ... }, "banner": { ... } },
  "about":   { "hero": { ... }, "brand_story": { ... }, "values": { ... }, "service_cta": { ... } },
  "contact": { "hero": { ... }, "sidebar": { ... } },
  "faq":     { "categories": [ { "label": "...", "items": [ { "q": "...", "a": "..." } ] } ] },
  "shop":    { "hero": { ... } },
  "coa":     { "hero": { ... } },
  "legal":   { "privacy_policy": { "title": "...", "body": "..." }, "terms_conditions": { ... }, "return_policy": { ... }, "research_use_only": { ... } },
  "footer":  { "brand_body": "...", "ruo_disclaimer": "...", "quick_links": [ ... ], "compliance_links": [ ... ], "cta": { ... }, "newsletter": { ... }, "payment_methods": [ ... ], "copyright": "..." }
}
```

### `GET /wp-json/longevity/v1/cms/{page}`

Public, no auth. `{page}` is one of `home|about|contact|faq|shop|coa|legal|footer`.
Returns just that bundle (same shape as the corresponding top-level key
above). 404 with `{"error": "..."}` for an unknown page.

Example — `GET /wp-json/longevity/v1/cms/shop`:

```json
{
  "hero": {
    "announcement": "✦ New products being added weekly - check back! ✦",
    "eyebrow": "Longevity Peptides",
    "headline": "Shop All Peptides",
    "body": "Research-grade peptides, independently verified and shipped to Australia and New Zealand. Every product 3rd-party tested for purity, identity, and composition."
  }
}
```

### `POST /wp-json/longevity/v1/cms/{page}`

Auth: `current_user_can('manage_options')` **and** a valid `X-WP-Nonce`
header carrying a `wp_rest`-action nonce (the standard WP REST cookie-auth
nonce — same mechanism `wp_localize_script`/`wp_create_nonce('wp_rest')`
produces; this plugin doesn't invent a separate nonce action for this route).
Request body: raw JSON, shape matching the corresponding `GET` response for
that page (partial objects are fine — omitted fields keep their previously
stored value via the same deep-merge-over-defaults used for `GET`; **but
note:** any array (repeater or list) present in the body fully *replaces*
the stored array for that key rather than merging item-by-item — send the
complete list you want).

Every string value is sanitized server-side before saving:
`sanitize_textarea_field()` for every field on every page **except** `legal`,
whose `body` fields go through `wp_kses_post()` (safe HTML preserved — this
is the one place rich text/markup survives) and whose `title` fields go
through `sanitize_text_field()`.

Response: `200` with the saved (post-sanitization) bundle, same shape as
`GET`. Errors: `400` (body isn't valid JSON), `403` (missing/failed
capability or nonce check), `404` (unknown page).

Example — `POST /wp-json/longevity/v1/cms/shop`:

```json
{ "hero": { "headline": "Shop All Research Peptides" } }
```

→ `200`, full merged `shop` bundle back, `hero.headline` updated and every
other `shop.hero.*` field unchanged.

## Admin UI

wp-admin → **Longevity Peptides Content Manager → Content (CMS)** (`admin.php?page=longevity-cms`),
added as a submenu of the existing `longevity-content-manager` top-level menu, next to
"Product Tools" and "Guest Order Linking". Tabs (plain JS show/hide, no
routing) for each of the 8 pages; each tab is its own `<form>` posting to
`admin-post.php?action=lpcm_save_cms` (nonce action `lpcm_save_cms`,
`manage_options` required), which calls the same `LPCM_CMS::save_page()`
sanitize+save function the REST `POST` route calls, so wp-admin saves and
API saves are always consistent. Repeater fields (stats, timeline, FAQ
items, testimonials, category tiles, footer link columns, etc.) use
array-indexed `name="field[0][x]"` inputs with vanilla-JS "+ Add row" /
"Remove" buttons that renumber indexes client-side, mirroring how
`class-product-tools.php`'s CSV-textarea tool keeps its own admin page
dependency-free.

## Field reference by page

### `home`

- `hero`: `badge_text` (string), `overline_text` (string), `headline_line1`
  (string), `headline_line2` (string), `headline_line3` (string), `body_text`
  (text), `disclaimer_text` (string), `cta_primary_label` (string),
  `cta_primary_href` (string), `cta_secondary_label` (string),
  `cta_secondary_href` (string), `stats` (repeater of `{val, label}`, 4 items
  by default).
- `quality`: `eyebrow` (string), `headline` (string), `body` (text),
  `metrics` (repeater of `{val, label}`, 3 overlay badges), `timeline`
  (repeater of `{title, detail}`, 4-step process).
- `bento`: `headline` (string), `tiles` (repeater of `{name, summary}`, 6
  category tiles).
- `feature_cards`: `eyebrow` (string), `headline` (string), `body` (text),
  `cards` (repeater of `{badge, title, body, cta_label, cta_href}` — empty
  `cta_label` means the card renders with no CTA link, matching card #2 in
  the live default).
- `testimonials`: `headline` (string), `reviews` (repeater of `{name,
  stars, text, date}` — `stars` is an integer 1-5).
- `banner`: `text` (string), `cta_label` (string), `cta_href` (string) — the
  top strip that reads "New Here? Create an account and get 10% off your
  first order" (`MilitaryBanner.tsx`'s non-sale-mode copy; the sale-mode
  copy is date-driven from `GP_SALE_END` in code and intentionally not
  covered here).

### `about`

- `hero`: `eyebrow`, `headline`, `body` (text).
- `brand_story`: `eyebrow`, `headline`, `stat_value` (e.g. `"5+"`),
  `stat_label`, `paragraphs` (repeater of `{text}` — 4 paragraphs by
  default).
- `values`: `eyebrow`, `headline`, `items` (repeater of `{title, desc}`, 6
  items). Note: each value also has an icon class (`ri-*`) in the source
  component — icons are not exposed as an editable field here since they're
  purely presentational/coupled to the component's icon set, not copy.
- `service_cta`: `eyebrow`, `headline`, `body` (text), `cta_primary_label`,
  `cta_primary_href`, `cta_secondary_label`, `cta_secondary_href`.

Not modeled here (read but judged non-editorial/presentational):
`AboutStats.tsx`, `AboutProcess.tsx`, `AboutTrustBar.tsx` were referenced by
`AboutPage.tsx` but not enumerated in the task spec's field list — flagged
below under "Not fully confident."

### `contact`

- `hero`: `eyebrow`, `headline`, `body` (text).
- `sidebar`: `phone`, `phone_note`, `email`, `email_note`, `location_line1`,
  `location_line2`, `hours_line1`, `hours_line2`, `promo_title`,
  `promo_body` (text). Form-field logic in `ContactForm.tsx` is untouched —
  only the surrounding static copy in `ContactHero.tsx`/`ContactSidebar.tsx`
  is modeled.

### `faq`

- `categories`: repeater of `{label, items}`, where `items` is itself a
  repeater of `{q, a}`. Default: 6 categories (About Peptides, Purity &
  Testing, Ordering & Payment, Shipping & Delivery, Storage & Handling,
  Research Use Only), matching `src/pages/faq/faqData.ts` exactly (18 Q/A
  items total). The `icon` (`ri-*` class) field present in the TS source's
  `FAQCategory` type is intentionally not exposed — same reasoning as
  `about.values` above.

### `shop`

- `hero`: `announcement` (the cyan banner strip), `eyebrow`, `headline`,
  `body` (text).

### `coa`

- `hero`: `eyebrow`, `headline`, `body` (text). (`COAPage.tsx` also renders
  `COAStats`, `COAFilters`, `COAGrid`, etc. below the hero — all
  data-driven from actual COA records, not editorial copy, so out of scope
  per the task's own carve-out.)

### `legal`

One entry per legal page, each `{title, body}`:

- `privacy_policy`
- `terms_conditions`
- `return_policy`
- `research_use_only`

`title` is plain text (`sanitize_text_field`). `body` is a single HTML blob
(`wp_kses_post`) — the whole page's content as one rich-text field, per the
task spec's explicit instruction to model these as "a single rich-text/
textarea blob per page rather than granular fields." **All four `body`
defaults ship empty (`""`)** — see "Not fully confident" below; the frontend
should treat an empty `legal.*.body` as "no CMS override yet, keep rendering
the hardcoded React copy," not as "render nothing."

### `footer`

- `brand_body` (text) — the blurb under the wordmark.
- `ruo_disclaimer` (text) — the RUO disclaimer box.
- `quick_links` (repeater of `{label, href}`, 7 items — "Quick Links"
  column).
- `compliance_links` (repeater of `{label, href}`, 6 items — "Compliance &
  Legal" column).
- `cta`: `eyebrow`, `headline`, `body` (text) — the pre-footer CTA banner.
- `newsletter`: `title`, `body` — the newsletter column's static copy (the
  Mailchimp form logic itself is untouched, only this label/blurb text).
- `payment_methods` (repeater of `{label, sub}` — "We Accept" row, defaults
  to a single Visa/Mastercard-via-NiftiPay entry).
- `copyright` (string) — bottom-bar copyright line.

Social icon links (Facebook/Instagram/X) in `FooterSection.tsx` are not
modeled — hardcoded to standard homepage URLs with no accompanying editorial
text, judged non-editorial/config rather than copy.

## Not fully confident about / flagged for follow-up

- **Legal page bodies are stored empty by default**, not populated from the
  live JSX. Each of the four legal pages (`PrivacyPolicy.tsx`,
  `TermsConditions.tsx`, `ReturnPolicy.tsx`, `ResearchUseOnly.tsx`) is
  several hundred lines of numbered `<section>`s, warning boxes, and
  sub-lists — reproducing them as one faithful HTML blob is a real
  transcription job, not a field-shape inference, and risks silently
  drifting from the legal text WITHOUT a careful line-by-line copy. The
  `{title, body}` shape and sanitization path are implemented and tested
  (`wp_kses_post`), but the actual legal copy still needs to be pasted into
  each field via wp-admin (or a follow-up import script) before the
  frontend can safely switch these four pages over to CMS-sourced content.
- **`about.hero`, `about.brand_story`, `about.values`, `about.service_cta`**
  cover the four sections the task spec explicitly named. `AboutPage.tsx`
  also renders `AboutStats`, `AboutProcess`, and `AboutTrustBar`, which
  weren't in the spec's field list — I did not open those three files or
  add fields for them, since the spec's explicit list ("hero copy, brand
  story paragraphs, values list, service CTA") reads as a deliberate scope
  cut, not an oversight. Worth a follow-up look if those sections also turn
  out to carry hardcoded editorial copy.
- **Testimonials data source**: the task said to check `src/mocks/products.ts`
  for a `testimonials`/`reviews` export; there isn't one — the three reviews
  are a local `const reviews = [...]` inside `TestimonialsSection.tsx`
  itself, which is what the `home.testimonials.reviews` default mirrors.
- **FAQ/Values `icon` fields** (Remix Icon classes like `ri-flask-line`) are
  read in the source but deliberately left out of the editable model —
  they're presentational/coupled to the icon set the component imports, not
  text an admin would sensibly free-type. If the frontend team wants icons
  editable too, that's an additive change to `faq.categories[].icon` /
  `about.values.items[].icon`, not a breaking one.
