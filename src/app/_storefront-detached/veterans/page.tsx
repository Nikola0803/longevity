import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";

export const metadata: Metadata = {
  title: "Military, Veterans & First Responders Discount",
  description:
    "Active military, veterans, and first responders get 23% off every order, for life. A permanent thank-you, not a one-time promo code.",
  alternates: { canonical: "/veterans" },
};

const BRANCHES = [
  { icon: "ri-shield-star-line", label: "Active Duty & Reserve" },
  { icon: "ri-medal-line", label: "Veterans" },
  { icon: "ri-first-aid-kit-line", label: "Fire & EMS" },
  { icon: "ri-police-car-line", label: "Law Enforcement" },
];

const STEPS = [
  {
    n: "01",
    title: "Reach out",
    body: "Contact us and let us know you're active military, a veteran, or a first responder. A quick note is all it takes to get started.",
  },
  {
    n: "02",
    title: "Verify service",
    body: "Send a photo of a service or agency ID, DD-214, or other reasonable proof of service or duty. We review by hand, no third-party verification service, no stored documents beyond confirming eligibility.",
  },
  {
    n: "03",
    title: "Get your code",
    body: "We issue a personal discount code tied to your account: 23% off every order, for life. No expiration, no re-verification required on future orders.",
  },
];

export default function VeteransPage() {
  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner /><Header />
      <main>
        {/* Hero */}
        <section className="relative pt-[112px] bg-background-900 border-b border-background-200/60 overflow-hidden">
          <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none"></div>
          <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-primary-500/5 blur-[140px] pointer-events-none"></div>
          <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-primary-500/60"></span>
                <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">Military, Veterans & First Responders</span>
              </div>
              <h1 className="font-display text-[44px] md:text-[64px] leading-[0.95] tracking-tightest text-foreground-100 mb-6 max-w-3xl">
                You serve. <span className="text-platinum">We take care of the rest.</span>
              </h1>
              <p className="text-[16px] text-foreground-400 max-w-xl leading-relaxed mb-8">
                Active military, veterans, and first responders get 23% off every order, for life. It's a small, permanent thank-you from our team, not a one-time promo.
              </p>
              <div className="flex flex-wrap gap-3">
                {BRANCHES.map((b) => (
                  <span
                    key={b.label}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-primary-500/25 bg-primary-500/5 font-mono text-[11px] text-primary-500"
                  >
                    <i className={`${b.icon} text-[14px]`}></i>{b.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-5 h-[280px] relative rounded-xl overflow-hidden border border-background-200/60">
              <img
                src="https://images.pexels.com/photos/8865116/pexels-photo-8865116.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="American flag memorial"
                className="w-full h-full object-cover"
              />
              <div className="photo-fade absolute inset-0 bg-gradient-to-t from-background-900/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-background-900/85 backdrop-blur border border-background-200/50">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></span>
                <span className="font-mono text-[10px] tracking-[0.08em] text-foreground-200 uppercase">23% Off, For Life</span>
              </div>
            </div>
          </div>
        </section>

        {/* Offer detail */}
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">/ 01 · The Offer</span>
                <span className="w-8 h-px bg-primary-500/40"></span>
              </div>
              <h2 className="font-display text-[32px] md:text-[40px] leading-[1.05] tracking-tightest text-foreground-100 mb-5">
                23% off, every order, permanently.
              </h2>
              <p className="text-[14px] text-foreground-500 leading-relaxed mb-4">
                This isn&#39;t a limited-time code. Once your service is verified, the discount is tied to your account and applies automatically at checkout on every future order, no re-application, no fine print, no minimum spend.
              </p>
              <p className="text-[14px] text-foreground-500 leading-relaxed">
                It stacks with our standard research-grade pricing, meaning military, veteran, and first-responder researchers pay less than list on every compound in the catalog, permanently.
              </p>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-xl border border-primary-500/25 bg-primary-500/[0.04] p-8 md:p-10">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-display text-[64px] md:text-[80px] leading-none text-platinum">23%</span>
                  <span className="font-mono text-[13px] text-primary-500 uppercase tracking-wide">off for life</span>
                </div>
                <p className="text-[13px] text-foreground-500 mb-6">Applied automatically once your code is issued. No expiration.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-background-200/40">
                  {[
                    { icon: "ri-infinity-line", label: "No expiration" },
                    { icon: "ri-repeat-line", label: "Every order" },
                    { icon: "ri-lock-unlock-line", label: "One-time verification" },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2">
                      <i className={`${f.icon} text-[16px] text-primary-500`}></i>
                      <span className="text-[12px] text-foreground-300">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to claim */}
        <section className="border-t border-background-200/60 bg-background-900/40 py-16 md:py-24">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10">
            <div className="max-w-2xl mb-14">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">/ 02 · How To Claim It</span>
                <span className="w-8 h-px bg-primary-500/40"></span>
              </div>
              <h2 className="font-display text-[32px] md:text-[40px] leading-[1.05] tracking-tightest text-foreground-100">
                Three steps. A couple of minutes.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STEPS.map((step) => (
                <div key={step.n} className="relative rounded-xl bg-background-900/70 border border-background-200/60 p-6">
                  <span className="font-mono text-[11px] text-primary-500 mb-4 block">{step.n}</span>
                  <h3 className="font-display text-[17px] text-foreground-100 mb-2">{step.title}</h3>
                  <p className="text-[13px] text-foreground-500 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why we do this */}
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">/ 03 · Why</span>
                <span className="w-8 h-px bg-primary-500/40"></span>
              </div>
              <h2 className="font-display text-[28px] md:text-[34px] leading-[1.05] tracking-tightest text-foreground-100">
                People who show up for others deserve a supplier that shows up for them.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-[14px] text-foreground-400 leading-relaxed mb-4">
                A meaningful share of our team and our researcher base has served, in uniform or on a rig. We built this discount because it&#39;s the right thing to do, not because it&#39;s a marketing angle.
              </p>
              <p className="text-[14px] text-foreground-400 leading-relaxed">
                Same purity standards, same published COAs, same lyophilized ambient shipping as every other order. The only thing that changes is the price.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-background-200/60 bg-background-900/50 py-14">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-[24px] text-foreground-100 mb-1">Ready to verify your service?</h2>
              <p className="text-[14px] text-foreground-500">Reach out and mention this page. We&#39;ll walk you through it.</p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 h-10 px-6 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <i className="ri-mail-line text-[14px]"></i>Contact Us
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
