"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/lib/products-context";

const CATEGORIES = [
  { label: "All Compounds", value: "all" },
  { label: "Peptides", value: "Peptides" },
  { label: "Fat Loss & Metabolic", value: "Fat Loss & Metabolic" },
  { label: "Recovery & Repair", value: "Recovery & Repair" },
  { label: "Longevity", value: "Longevity" },
  { label: "Cognitive", value: "Cognitive" },
  { label: "Peptide Blends", value: "Peptide Blends" },
  { label: "Research Supplies", value: "Research Supplies" },
];

const SORTS = ["Featured", "Price: Low to High", "Price: High to Low", "Purity %"];

// Format filter is ours, not a copy of any reference site's taxonomy — it
// just exposes the packSize dimension (single vial vs 10-pack kit) added
// alongside the existing category rail below.
const FORMATS = [
  { label: "All Formats", value: "all" },
  { label: "Individual Vials", value: "single" },
  { label: "10-Pack Kits", value: "kit" },
];

function ShopPageInner() {
  const [searchParams] = useSearchParams();
  const products = useProducts();
  const VISIBLE = useMemo(() => products.filter((p) => !p.hidden), [products]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFormat, setActiveFormat] = useState("all");
  const [sortBy, setSortBy] = useState("Featured");
  const [search, setSearch] = useState("");

  // Support a ?q= deep link (used by the site-search JSON-LD action and
  // shareable "search this catalog" links) without changing the filter's
  // own local-state behavior once the user starts typing.
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = VISIBLE;
    if (activeCategory !== "all") list = list.filter((p) => p.category === activeCategory);
    if (activeFormat === "single") list = list.filter((p) => (p.packSize ?? 1) <= 1);
    else if (activeFormat === "kit") list = list.filter((p) => (p.packSize ?? 1) > 1);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (sortBy === "Price: Low to High") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === "Purity %") list = [...list].sort((a, b) => parseFloat(b.purity) - parseFloat(a.purity));
    return list;
  }, [activeCategory, activeFormat, sortBy, search, VISIBLE]);

  const countFor = (cat: string) =>
    cat === "all" ? VISIBLE.length : VISIBLE.filter((p) => p.category === cat).length;

  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner /><Header />
      <main>
        {/* Hero */}
        <section className="relative pt-[96px] bg-background-900 border-b border-background-200/60">
          <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none"></div>
          <div className="absolute top-24 right-10 w-72 h-72 rounded-full bg-primary-500/5 blur-[120px] pointer-events-none"></div>
          <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-10 py-14 md:py-16">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-px bg-primary-500/60"></span>
              <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">Catalog</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="font-display text-[40px] md:text-[54px] leading-[0.95] tracking-tightest text-foreground-100">
                  Research Compounds
                </h1>
                <p className="mt-3 text-[14px] text-foreground-500 max-w-md">
                  Every batch independently verified. Every COA published. No exceptions.
                </p>
              </div>
              {/* Live search */}
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-500 text-[14px]"></i>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search compounds…"
                  className="h-10 pl-9 pr-4 rounded-md bg-background-100 border border-background-200 text-[13px] text-foreground-100 placeholder:text-foreground-600 focus:border-primary-500 focus:outline-none transition w-64"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category rail */}
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 pt-10 pb-2">
          <div className="relative group/rail">
            <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1" style={{ scrollbarWidth: "none" }}>
              {CATEGORIES.map((cat) => {
                const active = activeCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`relative shrink-0 flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all duration-300 ease-precision cursor-pointer ${
                      active
                        ? "border-primary-500/60 bg-primary-500/10 shadow-[0_0_20px_-6px_rgb(var(--primary-500) / 0.3)]"
                        : "border-background-200/60 bg-background-100 hover:border-foreground-500/30 hover:bg-background-800/60"
                    }`}
                  >
                    {active && <i className="ri-apps-line text-[14px] text-primary-500"></i>}
                    <span className={`text-[13px] font-medium whitespace-nowrap transition-colors ${active ? "text-primary-500" : "text-foreground-300"}`}>
                      {cat.label}
                    </span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded transition-colors ${active ? "bg-primary-500/20 text-primary-500" : "bg-background-200/60 text-foreground-600"}`}>
                      {countFor(cat.value)}
                    </span>
                    {active && <span className="absolute -bottom-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent"></span>}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sort bar */}
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <p className="text-[13px] text-foreground-400">
              <span className="font-mono text-foreground-200">{filtered.length}</span>
              <span className="mx-1">of</span>
              <span className="font-mono text-foreground-200">{VISIBLE.length}</span>
              <span className="ml-1">compounds</span>
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-[0.2em] text-foreground-600 uppercase mr-1">Format</span>
                <div className="flex items-center bg-background-100 rounded-md border border-background-200 p-0.5">
                  {FORMATS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setActiveFormat(f.value)}
                      className={`px-3 py-1.5 rounded text-[12px] transition-all whitespace-nowrap cursor-pointer ${
                        activeFormat === f.value
                          ? "bg-primary-500 text-background-900 font-semibold"
                          : "text-foreground-400 hover:text-foreground-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-[0.2em] text-foreground-600 uppercase mr-1">Sort</span>
                <div className="flex items-center bg-background-100 rounded-md border border-background-200 p-0.5 overflow-x-auto no-scrollbar">
                  {SORTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-3 py-1.5 rounded text-[12px] transition-all whitespace-nowrap cursor-pointer ${
                        sortBy === s
                          ? "bg-primary-500 text-background-900 font-semibold"
                          : "text-foreground-400 hover:text-foreground-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product grid */}
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 pb-24">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <i className="ri-search-line text-[40px] text-foreground-600 mb-4"></i>
              <p className="text-foreground-400 text-[15px] mb-2">No compounds match your search.</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("all"); setActiveFormat("all"); }}
                className="mt-4 h-9 px-5 rounded-md border border-background-200 text-[13px] text-foreground-300 hover:border-primary-500 hover:text-primary-500 transition-all cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopPageInner />
    </Suspense>
  );
}
