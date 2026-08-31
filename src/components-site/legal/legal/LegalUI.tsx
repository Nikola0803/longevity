import Link from "next/link";
import { SITE } from "@/data/site-config";

/* ------------------------------------------------------------------ *
 * Shared building blocks for Vertalis legal / compliance pages.
 * Dark lab aesthetic: obsidian surfaces, mono eyebrows, cyan accent,
 * signal-red for warnings, success-green for affirmations.
 * ------------------------------------------------------------------ */

export function LegalHero({
  line1,
  line2,
  breadcrumb,
}: {
  line1: string;
  line2: string;
  breadcrumb: string;
}) {
  return (
    <>
      {/* Dark header band */}
      <section className="relative bg-background-900 border-b border-background-200/60 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
        <div className="absolute inset-0 molecule-bg pointer-events-none" />
        <div className="relative w-full max-w-[860px] mx-auto px-6 md:px-10 py-20">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-px bg-primary-500/60" />
            <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">
              Legal &amp; Compliance
            </span>
          </div>
          <h1 className="font-display uppercase leading-[0.9] tracking-tightest text-[clamp(34px,5vw,60px)]">
            <span className="text-foreground-100">{line1}</span>
            <br />
            <span className="text-transparent [-webkit-text-stroke:1.5px_rgb(var(--primary-500) / 0.55)]">
              {line2}
            </span>
          </h1>
          <p className="mt-5 font-mono text-[11px] tracking-wider text-foreground-500">
            LAST UPDATED · {SITE.legalLastUpdated.toUpperCase()}
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-background-800 border-b border-background-200/60">
        <div className="w-full max-w-[860px] mx-auto px-6 md:px-10 py-3 flex items-center gap-2 text-[12px] text-foreground-500">
          <Link href="/" className="hover:text-primary-500 transition-colors">
            Home
          </Link>
          <i className="ri-arrow-right-s-line" />
          <span className="text-foreground-300">{breadcrumb}</span>
        </div>
      </div>
    </>
  );
}

export function LegalSection({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-[20px] uppercase tracking-tight text-foreground-100 mb-4 flex items-baseline gap-3">
        <span className="font-mono text-[13px] text-primary-500">
          {String(n).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="text-[14px] text-foreground-400 leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  );
}

export function Divider() {
  return <div className="border-t border-background-200/60" />;
}

/** Bold, high-contrast critical-notice box (signal-red accent). */
export function CriticalBox({
  label = "Critical Notice: Please Read",
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-lg p-6 md:p-7 border border-signal/30">
      <div className="flex gap-4 items-start">
        <span className="w-9 h-9 flex items-center justify-center rounded-md bg-signal/15 text-signal shrink-0">
          <i className="ri-alert-fill text-[18px]" />
        </span>
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-signal uppercase mb-3">
            {label}
          </p>
          <p className="text-[13px] text-foreground-300 leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  );
}

/** Softer inline disclaimer strip (cyan accent). */
export function NoticeBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass rounded-lg p-5 border border-primary-500/20 flex gap-3 items-start">
      <span className="w-6 h-6 flex items-center justify-center text-primary-500 shrink-0 mt-0.5">
        <i className="ri-information-line text-[16px]" />
      </span>
      <p className="text-[13px] text-foreground-300 leading-relaxed">{children}</p>
    </div>
  );
}

/** Affirmative list (green checks): e.g. purchaser warranties. */
export function CheckList({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3 rounded-md bg-background-100 border border-background-200/70"
        >
          <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 text-secondary-500">
            <i className="ri-check-line text-[15px] font-bold" />
          </span>
          <p className="text-[13px] text-foreground-300 leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  );
}

/** Prohibition list (red crosses): e.g. product-use restrictions. */
export function CrossList({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3 rounded-md bg-background-100 border border-signal/20"
        >
          <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 text-signal">
            <i className="ri-close-line text-[15px] font-bold" />
          </span>
          <p className="text-[13px] text-foreground-300 leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  );
}

/** Plain bulleted guideline list (muted arrows). */
export function ArrowList({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5 text-foreground-600">
            <i className="ri-arrow-right-s-line text-[15px]" />
          </span>
          <p className="text-[13px] text-foreground-400 leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  );
}

/** Icon feature grid (e.g. "what RUO means", "your rights"). */
export function IconGrid({
  items,
}: {
  items: { icon: string; title: string; desc: string }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((it) => (
        <div
          key={it.title}
          className="p-4 flex gap-3 items-start rounded-md bg-background-100 border border-background-200/70 glass-hover"
        >
          <span className="w-9 h-9 flex items-center justify-center rounded-md bg-primary-500/12 text-primary-500 shrink-0">
            <i className={`${it.icon} text-[16px]`} />
          </span>
          <div>
            <p className="font-medium text-[13px] text-foreground-100">{it.title}</p>
            <p className="text-[12px] text-foreground-500 mt-0.5 leading-relaxed">
              {it.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Numbered process steps (returns flow). */
export function StepList({
  steps,
}: {
  steps: { step: string; title: string; desc: string }[];
}) {
  return (
    <div className="space-y-3">
      {steps.map((s) => (
        <div
          key={s.step}
          className="flex gap-4 p-5 rounded-md bg-background-100 border border-background-200/70"
        >
          <span className="font-mono text-[28px] leading-none text-primary-500/40 shrink-0">
            {s.step}
          </span>
          <div>
            <p className="font-medium text-[13px] text-foreground-100 mb-1">{s.title}</p>
            <p className="text-[13px] text-foreground-400 leading-relaxed">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Contact card, reads from SITE config; hides blank fields, always links /contact. */
export function ContactCard({ dept }: { dept: string }) {
  return (
    <div className="rounded-lg p-6 bg-background-900 border border-background-200/60">
      <p className="font-display text-[14px] tracking-wide text-foreground-100 mb-1">
        {SITE.legalName} · {dept}
      </p>
      {SITE.contactPhone && (
        <p className="font-mono text-[12px] text-foreground-400 mt-1">
          Phone: {SITE.contactPhone}
        </p>
      )}
      {SITE.contactEmail && (
        <p className="font-mono text-[12px] text-foreground-400 mt-1">
          Email: {SITE.contactEmail}
        </p>
      )}
      {SITE.businessAddress && (
        <p className="text-[12px] text-foreground-500 mt-1">{SITE.businessAddress}</p>
      )}
      <p className="text-[12px] text-foreground-500 mt-3 leading-relaxed">
        You can also reach us any time through our{" "}
        <Link href="/contact" className="text-primary-500 hover:underline">
          contact page
        </Link>
        .
      </p>
    </div>
  );
}

export function RelatedLinks({
  links,
}: {
  links: { label: string; href: string }[];
}) {
  return (
    <div className="mt-16 pt-10 border-t border-background-200/60">
      <p className="font-mono text-[10px] tracking-[0.28em] text-foreground-500 uppercase mb-6">
        Related Legal Documents
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {links.map((doc) => (
          <Link
            key={doc.label}
            href={doc.href}
            className="group flex items-center justify-between px-5 py-4 rounded-md bg-background-100 border border-background-200/70 hover:border-primary-500/40 transition-colors"
          >
            <span className="text-[13px] font-medium text-foreground-200 group-hover:text-primary-500 transition-colors">
              {doc.label}
            </span>
            <i className="ri-arrow-right-line text-foreground-500 group-hover:text-primary-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
