import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import { SITE } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Lab Affiliate Program",
  description:
    "Earn commission on every order you refer, up to 16%, with a 30-day cookie window and monthly payouts. Built for researchers, lab managers, and institutions.",
  alternates: { canonical: "/affiliate" },
};

const BENEFITS = [
  { icon: "ri-percent-line", title: "Commission on Every Order", body: "Earn a percentage on every verified order placed through your unique referral link or personal discount code." },
  { icon: "ri-dashboard-line", title: "Affiliate Dashboard", body: "Track clicks, conversions, and earnings in real time through your dedicated affiliate portal." },
  { icon: "ri-gift-line", title: "Personal Discount", body: "Affiliates receive a personal discount code for their own research procurement in addition to commission earnings." },
  { icon: "ri-time-line", title: "30-Day Cookie Window", body: "Referral attribution is tracked for 30 days from the initial click. Not just the first session." },
  { icon: "ri-secure-payment-line", title: "Monthly Payouts", body: "Earnings are paid out monthly via Zelle, Venmo, or Cash App once your confirmed balance reaches the $25 minimum." },
  { icon: "ri-community-line", title: "Priority Support", body: "Lab affiliates get dedicated priority support for their own orders and a direct contact line to the team." },
];

// Illustrative starting points, not an automated real-time tier system — the
// program currently sets each affiliate's commission % individually when an
// account is approved (see commission_pct in the affiliate portal). Higher
// tiers are available on request once your referral volume grows; they are
// reviewed and applied manually, not triggered automatically.
const TIERS = [
  { label: "Researcher", commission: "8%", minVolume: "Starting rate", color: "border-foreground-500/30 text-foreground-400" },
  { label: "Lab Associate", commission: "12%", minVolume: "~$2,000/mo referred", color: "border-primary-500/40 text-primary-500" },
  { label: "Principal", commission: "16%", minVolume: "~$5,000/mo referred", color: "border-secondary-500/40 text-secondary-500" },
];

// Blank affiliatePortalUrl routes Apply/Log In to /contact instead of a
// broken or placeholder domain — see data/site-config.ts.
const PORTAL_URL = SITE.affiliatePortalUrl.replace(/\/+$/, "");
const APPLY_HREF = PORTAL_URL ? `${PORTAL_URL}/vertalis/register` : "/contact";
const LOGIN_HREF = PORTAL_URL ? `${PORTAL_URL}/vertalis/login` : "/contact";
const PORTAL_LIVE = Boolean(PORTAL_URL);

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner /><Header />
      <main>
        {/* Hero */}
        <section className="relative pt-[112px] bg-background-900 border-b border-background-200/60 overflow-hidden">
          <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none"></div>
          <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-primary-500/6 blur-[140px] pointer-events-none"></div>
          <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-primary-500/60"></span>
                <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">Lab Affiliate Program</span>
              </div>
              <h1 className="font-display text-[44px] md:text-[64px] leading-[0.95] tracking-tightest text-foreground-100 mb-6 max-w-3xl">
                Refer colleagues.<br /><span className="text-platinum">Earn on every order.</span>
              </h1>
              <p className="text-[16px] text-foreground-400 max-w-xl leading-relaxed mb-10">
                Designed for researchers, lab managers, and institutions who trust Vertalis and want to extend that trust, and earn while doing it.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="#apply" className="h-12 px-8 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer inline-flex items-center gap-2">
                  <i className="ri-user-add-line text-[14px]"></i>Apply Now
                </a>
                <a href="#tiers" className="h-12 px-8 rounded-md border border-background-200 text-[13px] text-foreground-300 hover:border-primary-500 hover:text-primary-500 transition-all cursor-pointer inline-flex items-center gap-2">
                  View Commission Tiers
                </a>
                <a href={LOGIN_HREF} className="h-12 px-8 rounded-md text-[13px] text-foreground-500 hover:text-primary-500 transition-all cursor-pointer inline-flex items-center gap-2">
                  Already an affiliate? Log in <i className="ri-arrow-right-line text-[14px]"></i>
                </a>
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-5 h-[300px] relative rounded-xl overflow-hidden border border-background-200/60">
              <img
                src="https://images.pexels.com/photos/33175650/pexels-photo-33175650.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Two people shaking hands on a business partnership"
                className="w-full h-full object-cover"
              />
              <div className="photo-fade absolute inset-0 bg-gradient-to-t from-background-900/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-background-900/85 backdrop-blur border border-background-200/50">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></span>
                <span className="font-mono text-[10px] tracking-[0.08em] text-foreground-200 uppercase">Up to 16% Commission</span>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 md:py-32">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10">
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">/ 01 · How It Works</span>
                <span className="w-8 h-px bg-primary-500/40"></span>
              </div>
              <h2 className="font-display text-[38px] md:text-[48px] leading-[1.02] tracking-tightest text-foreground-100">
                Simple by design.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { n: "01", icon: "ri-user-add-line", title: "Apply", body: "Submit your affiliate application. We review eligibility within 48 hours and provide access to your dashboard and unique referral link." },
                { n: "02", icon: "ri-share-line", title: "Refer", body: "Share your link with colleagues, institutions, or in research communities. Every click is tracked for 30 days." },
                { n: "03", icon: "ri-money-dollar-circle-line", title: "Earn", body: "Earn commission on every confirmed order from your referrals. Paid monthly once your balance reaches the $25 minimum." },
              ].map((step) => (
                <div key={step.n} className="group relative p-8 rounded-xl bg-background-900/70 border border-background-200/60 hover:border-primary-500/30 transition-all duration-500">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-primary-500 mb-4 block">{step.n}</span>
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 mb-5 group-hover:bg-primary-500 group-hover:text-background-900 transition-all duration-500">
                    <i className={`${step.icon} text-[20px]`}></i>
                  </div>
                  <h3 className="font-display text-[20px] text-foreground-100 mb-2">{step.title}</h3>
                  <p className="text-[13px] text-foreground-500 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-t border-background-200/60 bg-background-900/40 py-24 md:py-32">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">/ 02 · Program Benefits</span>
                  <span className="w-8 h-px bg-primary-500/40"></span>
                </div>
                <h2 className="font-display text-[38px] md:text-[48px] leading-[1.02] tracking-tightest text-foreground-100">
                  What you get.
                </h2>
              </div>
              <div className="hidden lg:block lg:col-span-5 h-[220px] relative rounded-xl overflow-hidden border border-background-200/60">
                <img
                  src="https://images.pexels.com/photos/577210/pexels-photo-577210.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Laptop showing an analytics dashboard on a desk"
                  className="w-full h-full object-cover"
                />
                <div className="photo-fade absolute inset-0 bg-gradient-to-t from-background-900/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-background-900/85 backdrop-blur border border-background-200/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></span>
                  <span className="font-mono text-[10px] tracking-[0.08em] text-foreground-200 uppercase">Real-Time Click Tracking</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {BENEFITS.map((b) => (
                <div key={b.title} className="group relative rounded-xl bg-background-900/70 border border-background-200/60 p-6 hover:border-primary-500/25 transition-all duration-500">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 mb-4 group-hover:bg-primary-500/20 transition-colors">
                    <i className={`${b.icon} text-[18px]`}></i>
                  </div>
                  <h4 className="font-display text-[15px] text-foreground-100 mb-2">{b.title}</h4>
                  <p className="text-[13px] text-foreground-500 leading-relaxed">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commission tiers */}
        <section id="tiers" className="border-t border-background-200/60 py-24 md:py-32">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10">
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">/ 03 · Commission Tiers</span>
                <span className="w-8 h-px bg-primary-500/40"></span>
              </div>
              <h2 className="font-display text-[38px] md:text-[48px] leading-[1.02] tracking-tightest text-foreground-100">
                Scales with your network.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TIERS.map((tier) => (
                <div key={tier.label} className={`relative rounded-xl bg-background-900/70 border p-8 ${tier.color}`}>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3">{tier.label}</p>
                  <p className="font-display text-[52px] leading-none mb-1">{tier.commission}</p>
                  <p className="font-mono text-[11px] opacity-60 mb-6">commission per order</p>
                  <div className="pt-5 border-t border-background-200/40">
                    <p className="font-mono text-[10px] tracking-[0.18em] text-foreground-600 uppercase mb-1">Typical Volume</p>
                    <p className="text-[13px] text-foreground-300">{tier.minVolume}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-foreground-600 mt-6 max-w-2xl">
              Every affiliate starts at the Researcher rate when approved. Tier upgrades are reviewed and applied manually as your referral volume grows, not automatic — reach out any time to request a review.
            </p>
          </div>
        </section>

        {/* Application */}
        <section id="apply" className="border-t border-background-200/60 bg-background-900/50 py-24 md:py-32">
          <div className="w-full max-w-[640px] mx-auto px-6 md:px-10">
            <div className="text-center mb-12">
              <h2 className="font-display text-[38px] md:text-[48px] leading-[1.02] tracking-tightest text-foreground-100 mb-3">
                Apply to the program.
              </h2>
              <p className="text-[14px] text-foreground-500">Applications are reviewed by our team before your account is activated. We accept researchers, lab managers, and institutional buyers.</p>
            </div>
            <div className="rounded-xl bg-background-900/70 border border-background-200/60 p-8 md:p-10 text-center">
              {PORTAL_LIVE ? (
                <>
                  <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-primary-500/10 text-primary-500 mb-6">
                    <i className="ri-user-add-line text-[22px]"></i>
                  </div>
                  <p className="text-[14px] text-foreground-400 mb-8 max-w-sm mx-auto">
                    Create your affiliate account in the portal to get your referral link, personal discount code, and dashboard.
                  </p>
                  <a href={APPLY_HREF} className="w-full sm:w-auto inline-flex h-11 px-8 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer items-center justify-center gap-2">
                    <i className="ri-send-plane-line text-[14px]"></i>Apply in the Portal
                  </a>
                  <p className="text-[13px] text-foreground-500 mt-5">
                    Already applied?{" "}
                    <a href={LOGIN_HREF} className="text-primary-500 hover:text-primary-400 transition-colors">
                      Log in to your dashboard →
                    </a>
                  </p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-primary-500/10 text-primary-500 mb-6">
                    <i className="ri-mail-line text-[22px]"></i>
                  </div>
                  <p className="text-[14px] text-foreground-400 mb-8 max-w-sm mx-auto">
                    The affiliate portal is being finalized. Reach out and we&apos;ll get your account set up directly.
                  </p>
                  <Link href="/contact" className="w-full sm:w-auto inline-flex h-11 px-8 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer items-center justify-center gap-2">
                    <i className="ri-send-plane-line text-[14px]"></i>Contact Us to Apply
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      
    </div>
  );
}
