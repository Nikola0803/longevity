"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CoaModal from "@/components/CoaModal";
import { useCart } from "@/lib/cart-context";
import { PRODUCTS, getProduct, getRating } from "@/data/products";
import StarRating from "@/components/StarRating";

const TABS = ["Overview", "Specifications", "Certificate of Analysis", "Shipping & Handling", "Research References"];

function fmt(n: number) {
  return "$" + Math.round(n);
}

export default function ProductPageClient({ slug }: { slug: string }) {
  const { addItem } = useCart();
  const product = getProduct(slug) ?? getProduct("nvr-sema-10")!;
  const rating = getRating(product);

  const [activeTab, setActiveTab] = useState(0);
  const [showCoa, setShowCoa] = useState(false);

  // Related: same category, exclude self, max 4
  const related = PRODUCTS.filter(
    (p) => !p.hidden && p.category === product.category && p.slug !== product.slug
  ).slice(0, 4);

  const handleAddToCart = () => {
    addItem({
      slug: product.slug,
      name: product.name,
      spec: product.spec,
      price: product.price,
      image: product.image,
    });
  };

  const batchCode = "NVR-24-1108-A";

  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner /><Header />
      <main>
        {/* Breadcrumb */}
        <section className="pt-[112px] bg-background-900 border-b border-background-200/60">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-5">
            <nav className="flex items-center gap-2 text-[12px] text-foreground-500 font-mono">
              <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-primary-500 transition-colors">Shop</Link>
              <span>/</span>
              <Link href={`/shop/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="hover:text-primary-500 transition-colors">
                {product.category}
              </Link>
              <span>/</span>
              <span className="text-primary-500">{product.name}</span>
            </nav>
          </div>
        </section>

        {/* Main product section */}
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Image column */}
            <div className="lg:col-span-6 xl:col-span-5">
              <div className="flex flex-col gap-3 lg:sticky lg:top-[130px]">
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-background-100 border border-background-200/60">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.imgAlt}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground-600">
                      <i className="ri-flask-line text-[40px]"></i>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background-900/80 backdrop-blur border border-secondary-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 shadow-[0_0_6px_1px_rgb(var(--secondary-500) / 0.7)]"></span>
                    <span className="font-mono text-[10px] tracking-wider text-secondary-500">COA Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info column */}
            <div className="lg:col-span-6 xl:col-span-7">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-[10px] tracking-[0.22em] text-primary-500 uppercase">{product.category}</span>
                  <span className="w-5 h-px bg-background-200/60"></span>
                  <span className={`flex items-center gap-1.5 text-[11px] font-medium ${product.statusLabel === "In Stock" ? "text-secondary-500" : product.statusLabel === "Limited" ? "text-yellow-400" : "text-foreground-500"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${product.statusDot.includes("secondary") ? "bg-secondary-500" : product.statusDot.includes("yellow") ? "bg-yellow-400" : "bg-foreground-600"}`}></span>
                    {product.statusLabel}
                  </span>
                </div>
                <h1 className="font-display text-[38px] md:text-[48px] leading-[1.02] tracking-tightest text-foreground-100 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 mb-2">
                  <StarRating stars={rating.stars} count={rating.count} size="md" />
                </div>
                <p className="font-mono text-[14px] text-foreground-500">{product.spec}</p>
              </div>

              {/* Purity + batch badges */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary-500/30 bg-primary-500/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 shadow-[0_0_6px_1px_rgb(var(--secondary-500) / 0.7)]"></span>
                  <span className="font-mono text-[11px] text-primary-500">{product.purity} purity</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-background-200/60 bg-background-100">
                  <span className="font-mono text-[10px] text-foreground-500">Batch</span>
                  <span className="font-mono text-[11px] text-foreground-200">{batchCode}</span>
                  <button onClick={() => setShowCoa(true)} className="font-mono text-[10px] text-primary-500 hover:text-primary-400 transition-colors cursor-pointer">
                    View COA →
                  </button>
                </div>
              </div>

              {/* CTA panel */}
              <div className="mt-8">
                <div className="rounded-lg p-6 glass border border-background-200/60">
                  <div className="flex items-end justify-between mb-2">
                    <span className="font-display text-[40px] leading-none text-foreground-100">{fmt(product.price)}</span>
                  </div>
                  {product.statusLabel !== "In Stock" && (
                    <div className="flex items-center gap-2 mb-5">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                      <span className="text-[12px] font-medium text-yellow-400">{product.statusLabel} · order soon</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-5 p-3 rounded-md bg-background-100/50 border border-background-200/40">
                    <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded bg-primary-500/10 text-primary-500">
                      <i className="ri-shield-check-line text-[14px]"></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-foreground-500 mb-0.5">Current batch shipped</p>
                      <p className="font-mono text-[12px] text-foreground-200 truncate">{batchCode}</p>
                    </div>
                    <button onClick={() => setShowCoa(true)} className="shrink-0 ml-auto font-mono text-[10px] text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1 cursor-pointer">
                      Verify<i className="ri-arrow-right-up-line text-[11px]"></i>
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={product.disabled}
                    className="w-full h-12 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all duration-300 ease-precision hover:shadow-[0_0_24px_-4px_rgb(var(--primary-500) / 0.6)] flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="ri-shopping-bag-3-line text-[15px]"></i>
                    {product.disabled ? "Out of Stock" : `Add to Cart · ${fmt(product.price)}`}
                  </button>
                  <p className="mt-4 flex items-center gap-1.5 text-[11px] text-foreground-500">
                    <i className="ri-flask-line text-[13px]"></i>Lyophilized, ships ambient within 24 hours, no cold-chain needed
                  </p>
                </div>
              </div>

              {/* RUO notice */}
              <div className="mt-6">
                <div className="flex items-start gap-3 p-4 rounded-md border border-accent-300/30 bg-background-100/60">
                  <span className="w-8 h-8 flex items-center justify-center shrink-0 rounded-md border border-accent-300/40 text-accent-300 mt-0.5">
                    <i className="ri-shield-check-line text-[15px]"></i>
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] tracking-[0.2em] text-accent-300 uppercase">Research Use Only (RUO)</span>
                    </div>
                    <p className="text-[12px] text-foreground-500 leading-relaxed">
                      This product is intended for laboratory research purposes only. Not for human or veterinary use, and not for use as a drug, food, dietary supplement, or cosmetic. By purchasing, you confirm you are a qualified researcher operating within institutional guidelines.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs section */}
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-12 border-t border-background-200/60">
          <div>
            {/* Tab nav */}
            <div className="flex flex-wrap items-center border-b border-background-200/60 mb-8">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`relative px-5 py-3.5 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === i ? "text-primary-500" : "text-foreground-500 hover:text-foreground-300"
                  }`}
                >
                  {tab}
                  {activeTab === i && (
                    <span className="absolute bottom-0 left-5 right-5 h-px bg-primary-500"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="min-h-[300px]">
              {activeTab === 0 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-display text-[17px] text-foreground-100 mb-3">Compound Overview</h3>
                    <p className="text-[14px] text-foreground-400 leading-relaxed">
                      {product.description ??
                        `${product.name} (${product.spec}) is a research-grade peptide compound supplied for laboratory use. Vertalis maintains every batch under pharmaceutical-grade synthesis controls with independent third-party HPLC and mass-spec verification before release.`}
                      {" "}Each vial is lyophilized and sealed under inert atmosphere for maximum stability. Shelf-stable at ambient temperature in transit, so no cold-chain shipping is required.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Vial Size", value: product.spec },
                      { label: "Purity", value: product.purity },
                      { label: "Appearance", value: "White lyophilized powder" },
                      { label: "Storage", value: "−20°C ± 2°C" },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-md bg-background-100/60 border border-background-200/40">
                        <p className="font-mono text-[9px] tracking-[0.2em] text-foreground-600 uppercase mb-1">{item.label}</p>
                        <p className="text-[13px] text-foreground-200">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-md bg-background-100/60 border border-background-200/40">
                    <span className="w-8 h-8 flex items-center justify-center shrink-0 rounded-md bg-primary-500/10 text-primary-500 mt-0.5">
                      <i className="ri-information-line text-[16px]"></i>
                    </span>
                    <div>
                      <p className="text-[13px] text-foreground-300 font-medium mb-1">Research Context</p>
                      <p className="text-[12px] text-foreground-500 leading-relaxed">
                        This compound is supplied for laboratory research use only. Published literature citations are provided as research context. They do not constitute usage instructions or therapeutic recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 1 && (
                <div className="space-y-6">
                  <h3 className="font-display text-[17px] text-foreground-100 mb-3">Technical Specifications</h3>
                  <div className="rounded-md border border-background-200/60 overflow-hidden">
                    <table className="w-full text-left">
                      <tbody>
                        {[
                          ["Product Name", product.name],
                          ["Catalog Number", product.slug.toUpperCase()],
                          ["Format", "Lyophilized powder"],
                          ["Vial Size", product.spec],
                          ["Purity (HPLC)", `≥${product.purity}`],
                          ["Storage Temperature", "−20°C (long-term), 4°C (short-term)"],
                          ["Shelf Life", "24 months from date of manufacture (lyophilized, unopened)"],
                          ["Category", product.category],
                        ].map(([label, value], i) => (
                          <tr key={label} className={`border-b border-background-200/40 last:border-none ${i % 2 === 0 ? "bg-background-100/30" : ""}`}>
                            <td className="py-3 px-4 font-mono text-[11px] text-foreground-500 w-1/3">{label}</td>
                            <td className="py-3 px-4 text-[13px] text-foreground-200">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeTab === 2 && (
                <div className="space-y-6">
                  <h3 className="font-display text-[17px] text-foreground-100 mb-3">Certificate of Analysis</h3>
                  <p className="text-[14px] text-foreground-400 leading-relaxed">
                    Every VERTALIS batch is independently tested by a certified third-party laboratory before release. The COA includes full HPLC chromatograms, mass spectrometry confirmation, and purity quantification.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setShowCoa(true)}
                      className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer"
                    >
                      <i className="ri-shield-check-line text-[14px]"></i>View COA · Batch {batchCode}
                    </button>
                    <Link
                      href="/coa"
                      className="inline-flex items-center gap-2 h-10 px-6 rounded-md border border-background-200 text-[13px] text-foreground-300 hover:border-primary-500 hover:text-primary-500 transition-all cursor-pointer"
                    >
                      <i className="ri-archive-line text-[14px]"></i>Browse all COAs
                    </Link>
                  </div>
                </div>
              )}
              {activeTab === 3 && (
                <div className="space-y-6">
                  <h3 className="font-display text-[17px] text-foreground-100 mb-3">Shipping & Handling</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: "ri-flask-line", title: "Ambient Shipping", desc: "Peptides are lyophilized (freeze-dried) and fully stable at ambient temperature in transit, no ice packs or cold-chain packaging required." },
                      { icon: "ri-truck-line", title: "24h Dispatch", desc: "Orders confirmed before 2pm EST dispatch same business day via standard courier." },
                      { icon: "ri-global-line", title: "International", desc: "We ship worldwide. International buyers are responsible for import compliance in their jurisdiction." },
                    ].map((item) => (
                      <div key={item.title} className="p-5 rounded-md bg-background-100/60 border border-background-200/40">
                        <i className={`${item.icon} text-[22px] text-primary-500 mb-3 block`}></i>
                        <h4 className="font-display text-[15px] text-foreground-100 mb-1">{item.title}</h4>
                        <p className="text-[13px] text-foreground-500 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 4 && (
                <div className="space-y-6">
                  <h3 className="font-display text-[17px] text-foreground-100 mb-3">Research References</h3>
                  <p className="text-[14px] text-foreground-400 leading-relaxed mb-6">
                    The following citations represent peer-reviewed research involving compounds in the {product.category} category. These are provided for informational purposes only and do not constitute therapeutic claims.
                  </p>
                  <div className="space-y-3">
                    {[
                      { journal: "Nature Medicine", year: "2023", title: "Receptor binding dynamics in GLP-1 analogue research." },
                      { journal: "Journal of Peptide Science", year: "2022", title: "Stability and bioactivity profiles of lyophilized research peptides." },
                      { journal: "Cell Metabolism", year: "2023", title: "Incretin signaling pathways and metabolic regulation: a review." },
                    ].map((ref, i) => (
                      <div key={i} className="p-4 rounded-md bg-background-100/60 border border-background-200/40 flex items-start gap-3">
                        <span className="font-mono text-[10px] text-foreground-600 mt-0.5 w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                        <div>
                          <p className="text-[13px] text-foreground-200 mb-0.5">{ref.title}</p>
                          <p className="font-mono text-[11px] text-primary-500">{ref.journal} · {ref.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related compounds */}
        {related.length > 0 && (
          <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-14 border-t border-background-200/60">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-[28px] text-foreground-100">Related Compounds</h2>
                  <p className="text-[13px] text-foreground-500 mt-1">Frequently researched together</p>
                </div>
                <Link href="/shop" className="group hidden sm:inline-flex items-center gap-2 text-[13px] text-foreground-400 hover:text-primary-500 transition-colors cursor-pointer">
                  View all<i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {related.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      
    {showCoa && (
        <CoaModal
          coa={{
            batchCode,
            compound: product.name,
            spec: product.spec,
            purity: product.purity,
            testDate: "2024-11-08",
            labRef: "JAN-2024-11-4782",
          }}
          onClose={() => setShowCoa(false)}
        />
      )}
    </div>
  );
}
