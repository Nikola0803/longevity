import type { Metadata } from "next";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import CoaGrid from "@/components/CoaGrid";
import { COA_RECORDS } from "@/data/coa-records";

export const metadata: Metadata = {
  title: "COA Archive",
  description:
    "Every Vertalis Certificate of Analysis, publicly searchable by batch code. Independent third-party lab results for every compound we ship.",
  alternates: { canonical: "/coa" },
};

export default function CoaPage() {
  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner /><Header />
      <main>
        <section className="relative pt-[112px] bg-background-900 border-b border-background-200/60">
          <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none"></div>
          <div className="absolute top-24 right-10 w-80 h-80 rounded-full bg-primary-500/5 blur-[120px] pointer-events-none"></div>
          <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-10 py-14 md:py-16">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-px bg-primary-500/60"></span>
              <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">Transparency</span>
            </div>
            <h1 className="font-display text-[38px] md:text-[52px] leading-[0.95] tracking-tightest text-foreground-100">COA Archive</h1>
            <p className="mt-3 text-[14px] text-foreground-500 max-w-lg">
              Every Certificate of Analysis, publicly searchable by batch code. {COA_RECORDS.length} records archived and counting.
            </p>
          </div>
        </section>

        <CoaGrid records={COA_RECORDS} />
      </main>
    </div>
  );
}
