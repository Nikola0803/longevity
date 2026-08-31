import Link from "next/link";

const SHOP_LINKS = [
  { label: "Peptides", href: "/shop/peptides" },
  { label: "Fat Loss & Metabolic", href: "/shop/fat-loss-metabolic" },
  { label: "Recovery & Repair", href: "/shop/recovery-repair" },
  { label: "Longevity", href: "/shop/longevity" },
  { label: "Cognitive", href: "/shop/cognitive" },
  { label: "Peptide Blends", href: "/shop/peptide-blends" },
  { label: "Research Supplies", href: "/shop/research-supplies" },
];
const VERIFY_LINKS = [
  { label: "COA Archive", href: "/coa" },
  { label: "Quality Standards", href: "/quality" },
  { label: "Testing Partners", href: "/quality#partners" },
  { label: "Batch Lookup", href: "/coa" },
];
const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Lab Affiliate Program", href: "/affiliate" },
  { label: "Vets & First Responders", href: "/veterans" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];
const LEGAL_LINKS = [
  { label: "Research Use Only", href: "/legal/research-use" },
  { label: "Shipping & Returns", href: "/legal/shipping-returns" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
];

function NavCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="font-mono text-[11px] tracking-[0.18em] text-foreground-500 uppercase mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="text-[13px] text-foreground-300 hover:text-primary-500 transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Payment method badge component
function PayBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[11px] font-semibold tracking-wide ${color}`}>
      {label}
    </span>
  );
}

export default function SiteFooter() {
  return (
    <footer className="relative bg-background-900 border-t border-background-200/60">
      <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none"></div>
      <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-10 pt-20 pb-10">
        {/* Top grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-background-200/60">
          {/* Brand + newsletter */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <span className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <span className="absolute inset-0 rounded-lg border border-primary-500/50 rotate-45"></span>
                <span className="absolute inset-[6px] rounded-md bg-primary-500/10 rotate-45"></span>
                <span className="relative w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_10px_2px_rgb(var(--primary-500) / 0.6)]"></span>
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-[19px] tracking-[0.22em] text-foreground-100">VERTALIS</span>
                <span className="font-mono text-[8px] tracking-[0.4em] text-foreground-500 uppercase mt-1">Laboratories</span>
              </span>
            </div>
            <p className="text-[14px] text-foreground-500 leading-relaxed max-w-md mb-6">
              Research updates delivered quarterly. New batch releases, methodology notes, and citations from the field. No hype.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md">
              <div className="hp-field" aria-hidden="true">
                <label htmlFor="website_alt">Website</label>
                <input id="website_alt" tabIndex={-1} autoComplete="off" readOnly aria-hidden="true" type="text" name="website_alt" defaultValue="" />
              </div>
              <input
                required
                placeholder="you@lab.edu"
                className="flex-1 h-11 px-4 rounded-md bg-background-100 border border-background-200 text-foreground-100 text-sm placeholder:text-foreground-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40 transition"
                type="email"
                name="email"
              />
              <button type="submit" className="h-11 px-5 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all whitespace-nowrap cursor-pointer">
                Subscribe
              </button>
            </form>
          </div>

          {/* Nav columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <NavCol title="Shop" links={SHOP_LINKS} />
            <NavCol title="Verify" links={VERIFY_LINKS} />
            <NavCol title="Company" links={COMPANY_LINKS} />
            <NavCol title="Legal" links={LEGAL_LINKS} />
          </div>
        </div>

        {/* RUO banner */}
        <div className="py-8 border-b border-background-200/60">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <span className="w-8 h-8 flex items-center justify-center rounded-md border border-accent-300/30 text-accent-300">
                <i className="ri-shield-check-line text-[15px]"></i>
              </span>
              <span className="font-mono text-[11px] tracking-[0.18em] text-accent-300 uppercase">Research Use Only</span>
            </div>
            <p className="text-[12px] text-foreground-500 leading-relaxed flex-1">
              All products sold on this website are intended for research and identification purposes only. These products are not intended for human dosing, injection, or ingestion. The statements made on this website have not been evaluated by the US Food and Drug Administration. The statements and the products of this company are not intended to diagnose, treat, cure, or prevent any disease. Vertalis is a chemical supplier, not a compounding pharmacy or outsourcing facility as defined under 503A or 503B of the Federal Food, Drug, and Cosmetic Act.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[12px] text-foreground-600 font-mono">© 2026 VERTALIS PEPTIDES · ALL RIGHTS RESERVED</p>
          <div className="flex items-center gap-5">
            <span className="text-[11px] font-mono text-foreground-600 tracking-wider">TESTED BY</span>
            <span className="text-[11px] font-mono text-foreground-400">JANOSHIK</span>
            <span className="w-px h-3 bg-background-300"></span>
            <span className="text-[11px] font-mono text-foreground-400">SIMEC</span>
            <span className="w-px h-3 bg-background-300"></span>
            <span className="text-[11px] font-mono text-foreground-400">ANRESCO</span>
          </div>
          {/* Payment methods: Zelle, CashApp, Venmo only */}
          <div className="flex items-center gap-2">
            <PayBadge label="Zelle" color="border-[#6D1ED4]/40 text-[#8B5CF6] bg-[#6D1ED4]/10" />
            <PayBadge label="Cash App" color="border-[#00D632]/30 text-[#00D632] bg-[#00D632]/10" />
            <PayBadge label="Venmo" color="border-[#008AFF]/30 text-[#008AFF] bg-[#008AFF]/10" />
          </div>
        </div>
      </div>
    </footer>
  );
}
