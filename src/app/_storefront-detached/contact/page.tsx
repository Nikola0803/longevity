import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "US-based support available 7 days a week for product questions, bulk orders, and documentation. We respond within 24 hours.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner /><Header />
      <main>
        <section className="relative pt-[112px] bg-background-900 border-b border-background-200/60">
          <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none"></div>
          <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-primary-500/60"></span>
                <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">Contact Us</span>
              </div>
              <h1 className="font-display text-[44px] md:text-[60px] leading-[0.95] tracking-tightest text-foreground-100 mb-4">
                Talk to the team.
              </h1>
              <p className="text-[15px] text-foreground-400 max-w-lg">
                US-based support available 7 days a week. Whether you have a product question, bulk order inquiry, or need documentation. We respond within 24 hours.
              </p>
            </div>
            <div className="hidden lg:block lg:col-span-5 h-[240px] relative rounded-xl overflow-hidden border border-background-200/60">
              <img
                src="https://images.pexels.com/photos/8867405/pexels-photo-8867405.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Customer support team member with headset"
                className="w-full h-full object-cover"
              />
              <div className="photo-fade absolute inset-0 bg-gradient-to-t from-background-900/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-background-900/85 backdrop-blur border border-background-200/50">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></span>
                <span className="font-mono text-[10px] tracking-[0.08em] text-foreground-200 uppercase">7 Days a Week · US-Based</span>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-7">
              <h2 className="font-display text-[24px] text-foreground-100 mb-6">Send a message</h2>
              <form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[["First Name", "text", "John"], ["Last Name", "text", "Doe"]].map(([label, type, ph]) => (
                    <div key={String(label)}>
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">{label} <span className="text-signal">*</span></label>
                      <input type={String(type)} placeholder={String(ph)} className="w-full h-10 px-3 rounded-md bg-background-100 border border-background-200 text-foreground-100 text-sm placeholder:text-foreground-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40 transition" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Email <span className="text-signal">*</span></label>
                  <input type="email" placeholder="you@lab.edu" className="w-full h-10 px-3 rounded-md bg-background-100 border border-background-200 text-foreground-100 text-sm placeholder:text-foreground-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40 transition" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Subject</label>
                  <input type="text" placeholder="Product inquiry, bulk order, COA request…" className="w-full h-10 px-3 rounded-md bg-background-100 border border-background-200 text-foreground-100 text-sm placeholder:text-foreground-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40 transition" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Message <span className="text-signal">*</span></label>
                  <textarea rows={6} placeholder="Describe your inquiry…" className="w-full px-3 py-3 rounded-md bg-background-100 border border-background-200 text-foreground-100 text-sm placeholder:text-foreground-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40 transition resize-none"></textarea>
                </div>
                <button type="submit" className="h-11 px-8 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer flex items-center gap-2">
                  <i className="ri-send-plane-line text-[14px]"></i>Send Message
                </button>
              </form>
            </div>

            {/* Contact info */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-display text-[24px] text-foreground-100 mb-6">Other ways to reach us</h2>
              {[
                { icon: "ri-mail-line", title: "Email", val: "orders@vertalispeptides.com", sub: "General inquiries & orders" },
                { icon: "ri-customer-service-2-line", title: "Support Hours", val: "7 days · 9AM–8PM EST", sub: "Response within 24 hours" },
                { icon: "ri-building-2-line", title: "Location", val: "United States", sub: "US-based operations & dispatch" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-5 rounded-xl bg-background-900/70 border border-background-200/60">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 shrink-0">
                    <i className={`${item.icon} text-[18px]`}></i>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-foreground-600 uppercase mb-0.5">{item.title}</p>
                    <p className="text-[14px] text-foreground-100 font-medium">{item.val}</p>
                    <p className="text-[12px] text-foreground-500">{item.sub}</p>
                  </div>
                </div>
              ))}
              <div className="p-5 rounded-xl bg-background-900/70 border border-background-200/60">
                <h3 className="font-display text-[15px] text-foreground-100 mb-3">Payment Methods</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 rounded-md border border-[#6D1ED4]/40 text-[#8B5CF6] bg-[#6D1ED4]/10 text-[11px] font-semibold">Zelle</span>
                  <span className="px-3 py-1.5 rounded-md border border-[#00D632]/30 text-[#00D632] bg-[#00D632]/10 text-[11px] font-semibold">Cash App</span>
                  <span className="px-3 py-1.5 rounded-md border border-[#008AFF]/30 text-[#008AFF] bg-[#008AFF]/10 text-[11px] font-semibold">Venmo</span>
                </div>
                <p className="mt-3 text-[12px] text-foreground-500">Include your order reference in payment notes for fastest dispatch.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
    </div>
  );
}
