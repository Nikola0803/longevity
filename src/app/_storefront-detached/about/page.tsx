import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Vertalis exists to be the research peptide supplier you don't have to take on faith. Documentation over claims, public COAs, and independent third-party testing on every batch.",
  alternates: { canonical: "/about" },
};

const PILLARS = [
  {
    icon: "ri-file-shield-2-line",
    title: "Documentation over claims.",
    body: "Anyone can say \"high purity.\" We'd rather hand you the chromatogram. Every batch we sell has a public COA behind it before it's obligated to.",
  },
  {
    icon: "ri-focus-3-line",
    title: "Specifics over adjectives.",
    body: "Purity percentage, molecular weight, endotoxin level, lab of record. Stated plainly, sourced from independent testing, not marketing copy.",
  },
  {
    icon: "ri-user-star-line",
    title: "Built for researchers.",
    body: "No consumer-health fluff, no vague benefit language. We write for people who already know what a COA is and want to find theirs fast.",
  },
];

const STANDARD_STEPS = [
  { n: "01", title: "Sourced from vetted partners", body: "Raw material from synthesis partners under NDA and audit. Not open-market grey supply." },
  { n: "02", title: "Tested before it's listed", body: "HPLC, LC-MS/MS, and endotoxin screening from independent labs, before a product goes live." },
  { n: "03", title: "COA published, not promised", body: "Every batch's certificate is public and searchable by code. You check it before you buy, not after." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-[112px] bg-background-900 border-b border-background-200/60 overflow-hidden">
          <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none"></div>
          <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-primary-500/5 blur-[140px] pointer-events-none"></div>
          <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-primary-500/60"></span>
                <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">About Vertalis</span>
              </div>
              <h1 className="font-display text-[40px] md:text-[60px] leading-[0.98] tracking-tightest text-foreground-100 max-w-3xl mb-6">
                Research peptides, <span className="text-platinum">without the guesswork.</span>
              </h1>
              <p className="text-[16px] text-foreground-400 leading-relaxed max-w-xl">
                The research peptide market grew faster than its standards did. Most suppliers sell on confidence and a nice label. Purity claims you can't check, sourcing you can't see. Vertalis exists to be the supplier where you don't have to take our word for it.
              </p>
            </div>
            <div className="hidden lg:block lg:col-span-5 h-[300px] relative rounded-xl overflow-hidden border border-background-200/60">
              <img
                src="https://images.pexels.com/photos/15509862/pexels-photo-15509862.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Laboratory flasks and research glassware"
                className="w-full h-full object-cover"
              />
              <div className="photo-fade absolute inset-0 bg-gradient-to-t from-background-900/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-background-900/85 backdrop-blur border border-background-200/50">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></span>
                <span className="font-mono text-[10px] tracking-[0.08em] text-foreground-200 uppercase">≥99% Purity · Every Batch Published</span>
              </div>
            </div>
          </div>
        </section>

        {/* Why we exist */}
        <section className="py-24 md:py-32">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">/ 01 · Why Vertalis</span>
                  <span className="w-8 h-px bg-primary-500/40"></span>
                </div>
                <h2 className="font-display text-[32px] md:text-[40px] leading-[1.05] tracking-tightest text-foreground-100">
                  There's no shortage of vendors. There's a shortage of ones you can verify.
                </h2>
              </div>
              <div className="lg:col-span-7 lg:col-start-6">
                <p className="text-[15px] text-foreground-400 leading-relaxed mb-5">
                  Every research-peptide site says "lab tested." Very few make it easy to see what that actually means for the vial in front of you. Which lab, what method, what the result was, and whether it's still current. We built Vertalis around the parts most vendors treat as an afterthought.
                </p>
                <p className="text-[15px] text-foreground-400 leading-relaxed">
                  That means leading with documentation instead of adjectives, treating the researcher on the other end of the order as someone who wants the actual numbers, and never dressing up a claim we can't back with paperwork.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What we stand for */}
        <section className="border-t border-background-200/60 bg-background-900/40 py-24 md:py-32">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10">
            <div className="max-w-2xl mb-14">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">/ 02 · What We Stand For</span>
                <span className="w-8 h-px bg-primary-500/40"></span>
              </div>
              <h2 className="font-display text-[32px] md:text-[40px] leading-[1.05] tracking-tightest text-foreground-100">
                Three rules we don't bend on.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PILLARS.map((p) => (
                <div key={p.title} className="group relative rounded-xl bg-background-900/70 border border-background-200/60 p-7 hover:border-primary-500/30 transition-all duration-500">
                  <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 mb-5 group-hover:bg-primary-500 group-hover:text-background-900 transition-all duration-500">
                    <i className={`${p.icon} text-[19px]`}></i>
                  </div>
                  <h3 className="font-display text-[17px] text-foreground-100 mb-2.5">{p.title}</h3>
                  <p className="text-[13px] text-foreground-500 leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our standard (condensed · full detail lives on /quality) */}
        <section className="py-24 md:py-32">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-14">
              <div className="lg:col-span-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">/ 03 · Our Standard</span>
                  <span className="w-8 h-px bg-primary-500/40"></span>
                </div>
                <h2 className="font-display text-[32px] md:text-[40px] leading-[1.05] tracking-tightest text-foreground-100 mb-4">
                  We only list what we can stand behind.
                </h2>
                <p className="text-[15px] text-foreground-400 leading-relaxed max-w-md">
                  Every Vertalis product goes through the same pipeline before it's allowed on the shelf. Independent labs report the results. Not us.
                </p>
                <Link href="/quality" className="group inline-flex items-center gap-2 mt-6 text-[13px] font-medium text-primary-500 hover:text-primary-400 transition-colors cursor-pointer">
                  See the full six-stage pipeline
                  <i className="ri-arrow-right-line text-[14px] group-hover:translate-x-1 transition-transform"></i>
                </Link>
                <div className="hidden lg:block h-[220px] mt-8 relative rounded-xl overflow-hidden border border-background-200/60">
                  <img
                    src="https://images.pexels.com/photos/3912482/pexels-photo-3912482.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    alt="Researcher using a pipette in the lab"
                    className="w-full h-full object-cover"
                  />
                  <div className="photo-fade absolute inset-0 bg-gradient-to-t from-background-900/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-background-900/85 backdrop-blur border border-background-200/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></span>
                    <span className="font-mono text-[10px] tracking-[0.08em] text-foreground-200 uppercase">Six-Stage Quality Pipeline</span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 lg:col-start-8 space-y-3">
                {STANDARD_STEPS.map((s) => (
                  <div key={s.n} className="flex items-start gap-4 rounded-lg bg-background-900/70 border border-background-200/60 p-5">
                    <span className="font-mono text-[11px] text-primary-500 mt-0.5">{s.n}</span>
                    <div>
                      <h4 className="font-display text-[14px] text-foreground-100 mb-1">{s.title}</h4>
                      <p className="text-[12.5px] text-foreground-500 leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                ))}
                <Link href="/coa" className="flex items-center justify-between rounded-lg border border-primary-500/30 bg-primary-500/5 p-5 hover:bg-primary-500/10 transition-colors cursor-pointer group">
                  <span className="text-[13px] font-medium text-primary-500">View our published COAs</span>
                  <i className="ri-arrow-right-line text-[14px] text-primary-500 group-hover:translate-x-1 transition-transform"></i>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* What we are not */}
        <section className="border-t border-background-200/60 bg-background-900/50 py-20">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">/ 04 · What Vertalis Is Not</span>
                <span className="w-8 h-px bg-primary-500/40"></span>
              </div>
              <p className="text-[15px] text-foreground-300 leading-relaxed mb-4">
                Vertalis is a research-use-only supplier. Our products are sold strictly for laboratory and in-vitro research. Not for human consumption, not for medical use, and not as a treatment or cure for any condition. We don't make therapeutic claims, and we're not going to start.
              </p>
              <p className="text-[14px] text-foreground-500 leading-relaxed">
                We'd rather tell you what we can prove than dress up what we can't. No grey-market sourcing. No inflated purity numbers. If we can't back a claim on paper, we don't make it.
              </p>
            </div>
          </div>
        </section>

        {/* Built to actually shop */}
        <section className="py-24 md:py-32">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">/ 05 · Built To Actually Shop</span>
                  <span className="w-8 h-px bg-primary-500/40"></span>
                </div>
                <h2 className="font-display text-[32px] md:text-[40px] leading-[1.05] tracking-tightest text-foreground-100 mb-5">
                  Whether you know exactly what you need, or not yet.
                </h2>
                <p className="text-[15px] text-foreground-400 leading-relaxed mb-6 max-w-md">
                  Browse by research category if you know the direction, or search by compound name and batch code if you already know exactly what's on your list. No account required to check a COA.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/shop" className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-primary-500 text-background-900 text-[12px] font-semibold hover:bg-primary-400 transition-all cursor-pointer">
                    Browse the Catalog
                  </Link>
                  <Link href="/coa" className="inline-flex items-center gap-2 h-10 px-5 rounded-md border border-background-200 text-foreground-200 text-[12px] font-medium hover:border-primary-500/50 hover:text-primary-500 transition-all cursor-pointer">
                    Look Up a COA
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "ri-flask-line", label: "By Category" },
                  { icon: "ri-search-line", label: "By Compound" },
                  { icon: "ri-shield-check-line", label: "By Batch Code" },
                  { icon: "ri-percent-line", label: "Bulk Pricing" },
                ].map((t) => (
                  <div key={t.label} className="rounded-xl bg-background-900/70 border border-background-200/60 p-6 flex flex-col items-start gap-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-md bg-primary-500/10 text-primary-500">
                      <i className={`${t.icon} text-[16px]`}></i>
                    </div>
                    <span className="text-[13px] text-foreground-300">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Real support */}
        <section className="border-t border-background-200/60 bg-background-900/50 py-16">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-[22px] text-foreground-100 mb-1">Real people, real support.</h2>
              <p className="text-[14px] text-foreground-500 max-w-lg">
                A question about a batch, an order, or a compound spec? You'll reach a person who works here. Not a script. No black-box sourcing, no miracle claims, just documented peptides you can actually find what you need on.
              </p>
            </div>
            <Link href="/contact" className="shrink-0 h-10 px-6 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer inline-flex items-center gap-2">
              <i className="ri-chat-3-line text-[14px]"></i>Contact Us
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
