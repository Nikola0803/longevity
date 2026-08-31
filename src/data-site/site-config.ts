/* ------------------------------------------------------------------ *
 * VERTALIS · Central compliance & site configuration
 * ------------------------------------------------------------------ *
 * Every legal page, the access gate, and the compliance banners read
 * from this single file. Edit the values below once and the whole site
 * updates. Fields left as empty strings are hidden gracefully (they will
 * not render a blank line), so you can ship without filling everything in
 * and add details as they are finalised.
 *
 * ⚠️  ITEMS MARKED "TODO" SHOULD BE REVIEWED BY YOU / YOUR COUNSEL BEFORE
 *     YOU BEGIN SELLING. See COMPLIANCE.md in the project root.
 * ------------------------------------------------------------------ */

export const SITE = {
  /** Display / marketing name */
  brand: "VERTALIS",
  /** Legal entity name used in contracts and policies */
  legalName: "Vertalis Peptides, LLC",
  /** Short tagline shown under the wordmark */
  tagline: "The Precision Standard in Research Peptides",

  /** Minimum age to access the site and purchase (years) */
  minimumAge: 21,

  /* --- Contact (blank fields are hidden on legal pages) --- */
  contactEmail: "", // TODO e.g. "compliance@vertalispeptides.com"; leave "" to route users to /contact
  contactPhone: "", // TODO e.g. "(000) 000-0000"; leave "" to hide
  /** Registered business mailing address, one line or blank */
  businessAddress: "", // TODO: leave "" to hide

  /* --- Jurisdiction & fulfilment --- */
  // TODO Confirm with counsel. Used in the Terms "Governing Law" section.
  governingLaw:
    "the laws of the jurisdiction in which Vertalis Peptides is organised, without regard to conflict-of-law provisions",
  /** Where you ship to, plain language for the Shipping policy */
  shipsTo: "the United States", // TODO adjust to your actual fulfilment regions
  /** Typical order handling time */
  handlingTime: "1–2 business days",

  /* --- Testing partners shown in trust strips (edit freely) --- */
  testingPartners: ["Janoshik", "SIMEC", "Anresco"],

  /* --- Payment receiving details, shown at checkout once a gateway is
     selected. Leave a field blank and its checkout panel shows a
     "confirmed by email" fallback instead of blank/fake info. --- */
  paymentHandles: {
    venmo: "", // TODO e.g. "@Vertalis-Peptides"
    cashapp: "", // TODO e.g. "$VertalisPeptides"
    zelle: "", // TODO e.g. "payments@vertalispeptides.com" or a phone number
  },

  /* --- Live chat. Leave whatsappNumber "" and the floating WhatsApp
     button routes to /contact instead of a wa.me link, so it never
     points at a wrong or fake number. --- */
  whatsappNumber: "", // TODO real WhatsApp Business number, digits only with country code, e.g. "15551234567"
  whatsappDefaultMessage: "Hi Vertalis, I have a question about an order.",

  /* --- Affiliate portal. Leave blank and the /affiliate page's Apply/Log In
     links route to /contact instead of a broken or placeholder domain.
     Once integrations/vp-affiliate-portal is deployed (its own Vercel
     project), set this to that deployment's base URL, e.g.
     "https://affiliates.vertalispeptides.com". Register/login routes are
     appended as /vertalis/register and /vertalis/login. --- */
  affiliatePortalUrl: "", // TODO real deployed URL of integrations/vp-affiliate-portal

  /** Last time the legal documents were reviewed/updated */
  legalLastUpdated: "January 1, 2026",

  /** Copyright year shown in footers */
  copyrightYear: 2026,
} as const;

/** Canonical legal routes (kept in sync with SiteFooter links). */
export const LEGAL_ROUTES = {
  researchUse: "/legal/research-use",
  shippingReturns: "/legal/shipping-returns",
  terms: "/legal/terms",
  privacy: "/legal/privacy",
} as const;
