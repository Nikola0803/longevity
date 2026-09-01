import { Link } from "react-router-dom";

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
            <Link to={l.href} className="text-[13px] text-foreground-300 hover:text-primary-500 transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
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
            <div className="flex items-center mb-5">
              <img
                src="https://longevitytech-lab.store/__l5e/assets-v1/ec7b1b43-b30c-4176-b423-54555bf0a418/longevitylab-logo.png"
                alt="Longevity Peptides"
                className="h-9 w-auto"
              />
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
              All products sold on this website are intended for research and identification purposes only. These products are not intended for human dosing, injection, or ingestion. The statements made on this website have not been evaluated by the Therapeutic Goods Administration (TGA). The statements and the products of this company are not intended to diagnose, treat, cure, or prevent any disease. Longevity Peptides is a chemical supplier, not a compounding pharmacy or dispensing facility.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[12px] text-foreground-600 font-mono">© 2026 LONGEVITY PEPTIDES · ALL RIGHTS RESERVED</p>
          <div className="flex items-center gap-5">
            <span className="text-[11px] font-mono text-foreground-600 tracking-wider">TESTED BY</span>
            <span className="text-[11px] font-mono text-foreground-400">JANOSHIK</span>
            <span className="w-px h-3 bg-background-300"></span>
            <span className="text-[11px] font-mono text-foreground-400">SIMEC</span>
            <span className="w-px h-3 bg-background-300"></span>
            <span className="text-[11px] font-mono text-foreground-400">ANRESCO</span>
          </div>
          {/* Payment methods: credit/debit card */}
          <div className="flex items-center gap-2 text-foreground-500">
            <i className="ri-visa-line text-[20px]"></i>
            <i className="ri-mastercard-line text-[20px]"></i>
          </div>
        </div>
      </div>
    </footer>
  );
}
