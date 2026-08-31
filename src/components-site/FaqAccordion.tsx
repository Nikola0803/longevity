"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "What are research peptides?",
    a: "Research peptides are short chains of amino acids used exclusively in laboratory and scientific research settings. They serve as tools for studying biological processes, receptor interactions, and metabolic pathways. All VERTALIS peptides are supplied as lyophilized powder for research use only.",
  },
  {
    q: "Are VERTALIS products for human use?",
    a: "No. All VERTALIS products are sold strictly for laboratory and research use only. They are not intended for human or veterinary use, and not for use as a drug, food, dietary supplement, or cosmetic. Every order is subject to our Research Use Only (RUO) compliance terms.",
  },
  {
    q: "How do I verify the purity of my batch?",
    a: "Every VERTALIS vial includes a batch code printed on the label. Enter this code on our COA Lookup page to retrieve the full Certificate of Analysis, including HPLC chromatograms, mass spectrometry data, and the independent laboratory report. All COAs are publicly archived and permanently searchable.",
  },
  {
    q: "What is lyophilized powder and how should I store it?",
    a: "Lyophilized powder is a freeze-dried form of the peptide that ensures maximum stability during storage and shipping. We recommend storing unopened vials at −20°C in a frost-free freezer, protected from light. Once reconstituted, peptides should be used promptly and stored according to the specific compound's stability profile.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept major credit and debit cards, bank wire transfers, and cryptocurrency payments. All transactions are processed through secure, encrypted gateways. For institutional purchase orders, please contact our support team directly.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes. VERTALIS ships to research institutions and laboratories worldwide. Shipping rates and transit times vary by destination. All international orders are subject to local import regulations. It is the buyer's responsibility to ensure compliance with their country's customs and import laws.",
  },
  {
    q: "What is your return policy?",
    a: "Due to the sensitive nature of lyophilized research materials, we cannot accept returns on opened or reconstituted products. If you receive a damaged vial or an incorrect shipment, contact our support team within 72 hours of delivery with photographic documentation, and we will arrange a replacement or refund.",
  },
  {
    q: "How does the Lab Affiliate Program work?",
    a: "Our Lab Affiliate Program allows qualifying research institutions and laboratories to earn credit on future orders by referring colleagues. Affiliates receive a unique referral link and trackable dashboard. Contact us or visit the Lab Affiliate page to learn more about eligibility and commission structure.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="relative bg-background-800 py-24 md:py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary-500/4 blur-[160px] pointer-events-none"></div>
      <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">/ 05 · FAQ</span>
            <span className="w-8 h-px bg-primary-500/40"></span>
          </div>
          <h2 className="font-display text-[38px] md:text-[52px] leading-[1.02] tracking-tightest text-foreground-100">
            Questions? <span className="text-platinum">We&#39;ve got answers.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-background-200/60 bg-background-900/70 overflow-hidden transition-all duration-400"
            >
              <button
                className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left cursor-pointer group"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-[15px] font-medium text-foreground-200 pr-2 leading-snug">{faq.q}</span>
                <span className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full border transition-all duration-300 ${open === i ? "border-primary-500 text-primary-500 rotate-45" : "border-background-200 text-foreground-500 group-hover:border-foreground-500/40 group-hover:text-foreground-300"}`}>
                  <i className="ri-add-line text-[13px]"></i>
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-400 ease-precision"
                style={{ maxHeight: open === i ? "400px" : "0px", opacity: open === i ? 1 : 0 }}
              >
                <p className="px-6 pb-5 text-[14px] text-foreground-500 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-[14px] text-foreground-500 mb-4">Didn&#39;t find what you&#39;re looking for?</p>
          <a href="/contact" className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-background-100 border border-background-200 text-[13px] font-medium text-foreground-200 hover:border-primary-500 hover:text-primary-500 transition-all cursor-pointer">
            <i className="ri-mail-line text-[14px]"></i>Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}
