import type { Metadata } from "next";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import FaqAccordion from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to what researchers ask before and after their first order: shipping, COAs, purity testing, payment methods, and more.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner /><Header />
      <main>
        <section className="relative pt-[112px] bg-background-900 border-b border-background-200/60">
          <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none"></div>
          <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-primary-500/60"></span>
                <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">FAQ</span>
              </div>
              <h1 className="font-display text-[44px] md:text-[60px] leading-[0.95] tracking-tightest text-foreground-100 mb-4">
                Frequently asked questions.
              </h1>
              <p className="text-[15px] text-foreground-400 max-w-lg">
                Everything researchers ask before and after their first order. If you need something not covered here, our team responds within 24 hours.
              </p>
            </div>
            <div className="hidden lg:block lg:col-span-5 h-[240px] relative rounded-xl overflow-hidden border border-background-200/60">
              <img
                src="https://images.pexels.com/photos/8533045/pexels-photo-8533045.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Laboratory microscope and research equipment"
                className="w-full h-full object-cover"
              />
              <div className="photo-fade absolute inset-0 bg-gradient-to-t from-background-900/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-background-900/85 backdrop-blur border border-background-200/50">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></span>
                <span className="font-mono text-[10px] tracking-[0.08em] text-foreground-200 uppercase">Answers Within 24 Hours</span>
              </div>
            </div>
          </div>
        </section>
        <FaqAccordion />
      </main>
    </div>
  );
}
