import Link from "next/link";

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];
const LEGAL_LINKS = [
  { label: "Research Use Only", href: "/legal/research-use" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
];

function NavCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="font-mono text-[11px] tracking-[0.18em] text-foreground-500 uppercase mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[13px] text-foreground-300 hover:text-primary-500 transition-colors">
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
    <footer className="bg-background-900 border-t border-background-200/60">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-background-200/60">
          <div className="lg:col-span-6">
            <span className="font-display text-[19px] tracking-[0.22em] text-foreground-100">VERTALIS</span>
            <p className="text-[14px] text-foreground-500 leading-relaxed max-w-md mt-4">
              Research peptides for laboratory use, with dose and pack options built for research protocols.
            </p>
          </div>
          <div className="lg:col-span-6 grid grid-cols-2 gap-8">
            <NavCol title="Company" links={COMPANY_LINKS} />
            <NavCol title="Legal" links={LEGAL_LINKS} />
          </div>
        </div>
        <div className="py-8 border-b border-background-200/60">
          <p className="text-[12px] text-foreground-500 leading-relaxed">
            All products sold on this website are intended for research and identification purposes only. Not for human
            consumption. Statements have not been evaluated by the FDA.
          </p>
        </div>
        <div className="pt-8">
          <p className="text-[12px] text-foreground-600 font-mono">© 2026 VERTALIS · ALL RIGHTS RESERVED</p>
        </div>
      </div>
    </footer>
  );
}
