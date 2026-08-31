"use client";

import { useMemo, useState } from "react";
import CoaModal from "@/components/CoaModal";

export interface CoaRecord {
  batchCode: string;
  product: string;
  category: string;
  purity: string;
  testDate: string;
  labRef: string;
}

const CATEGORIES = [
  "All",
  "Fat Loss & Metabolic",
  "Recovery & Repair",
  "Longevity",
  "Cognitive",
  "Peptide Blends",
  "Accessories",
];

export default function CoaGrid({ records }: { records: CoaRecord[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CoaRecord | null>(null);

  const filtered = useMemo(() => {
    let list = records;
    if (activeCategory !== "All") list = list.filter((r) => r.category === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) => r.batchCode.toLowerCase().includes(q) || r.product.toLowerCase().includes(q)
      );
    }
    return list;
  }, [records, activeCategory, search]);

  return (
    <>
      {/* Filters */}
      <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 pt-8 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`h-8 px-3.5 rounded-full border text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === c
                    ? "border-primary-500/60 bg-primary-500/10 text-primary-500"
                    : "border-background-200/60 bg-background-100 text-foreground-400 hover:text-foreground-200 hover:border-foreground-500/30"
                }`}
              >
                {c === "All" ? "All" : c}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-foreground-500"></i>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batch code or compound…"
              className="w-full h-10 pl-9 pr-4 rounded-full bg-background-100 border border-background-200/60 text-[13px] text-foreground-200 font-mono placeholder:text-foreground-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition"
              type="text"
            />
          </div>
        </div>
      </section>

      {/* Card grid */}
      <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-6">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((r) => (
              <button
                key={r.batchCode}
                onClick={() => setSelected(r)}
                className="group text-left rounded-xl border border-background-200/60 bg-background-100/40 p-5 hover:border-primary-500/40 transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <span className="font-mono text-[11px] text-primary-500">{r.batchCode}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-secondary-500 font-medium shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-500"></span>Passed
                  </span>
                </div>
                <h3 className="font-display text-[16px] text-foreground-100 mb-1 leading-tight">{r.product}</h3>
                <span className="font-mono text-[10px] tracking-wide text-foreground-500 uppercase mb-4">{r.category}</span>
                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-background-200/40">
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.15em] text-foreground-600 uppercase mb-1">Purity</p>
                    <p className="font-display text-[18px] text-foreground-100 leading-none">{r.purity}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.15em] text-foreground-600 uppercase mb-1">Test Date</p>
                    <p className="font-mono text-[12px] text-foreground-300">{r.testDate}</p>
                  </div>
                </div>
                <span className="mt-4 inline-flex items-center justify-center gap-1.5 h-9 rounded-md border border-background-200/60 bg-background-100 text-[11px] text-foreground-400 group-hover:text-primary-500 group-hover:border-primary-500/50 transition-colors">
                  <i className="ri-eye-line text-[12px]"></i>View Certificate
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <i className="ri-search-line text-[40px] text-foreground-600 mb-4"></i>
            <p className="text-foreground-400 text-[15px] mb-2">No COAs match your search.</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="mt-4 h-9 px-5 rounded-md border border-background-200 text-[13px] text-foreground-300 hover:border-primary-500 hover:text-primary-500 transition-all cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
        <div className="flex items-center justify-between mt-8 text-[11px] text-foreground-600 font-mono">
          <span>{filtered.length} of {records.length} COAs shown</span>
          <span>Last updated: {records[0]?.testDate}</span>
        </div>
      </section>

      {selected && (
        <CoaModal
          coa={{
            batchCode: selected.batchCode,
            compound: selected.product,
            spec: selected.category,
            purity: selected.purity,
            testDate: selected.testDate,
            labRef: selected.labRef,
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
