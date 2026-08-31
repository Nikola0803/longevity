"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUCTS } from "@/data/products";

const VISIBLE = PRODUCTS.filter((p) => !p.hidden);

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return VISIBLE.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  const goToShop = (q: string) => {
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-24 md:pt-32 px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background-900/80 backdrop-blur-md"></div>

      <div
        className="relative w-full max-w-xl bg-background-900 border border-background-200/60 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToShop(query);
          }}
          className="flex items-center gap-3 px-5 py-4 border-b border-background-200/60"
        >
          <i className="ri-search-line text-[17px] text-foreground-500"></i>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search compounds, e.g. BPC-157, Tirzepatide…"
            className="flex-1 bg-transparent text-[14px] text-foreground-100 placeholder:text-foreground-600 focus:outline-none"
            type="text"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="w-7 h-7 flex items-center justify-center rounded-md text-foreground-500 hover:text-foreground-100 hover:bg-background-200/40 transition-all cursor-pointer"
          >
            <i className="ri-close-line text-[16px]"></i>
          </button>
        </form>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === "" ? (
            <p className="px-5 py-8 text-center text-[13px] text-foreground-500">
              Start typing to search the catalog.
            </p>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((p) => (
                <Link
                  key={p.slug}
                  href={`/product/${p.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-background-100/50 transition-colors"
                >
                  <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden bg-background-100">
                    <img src={p.image} alt="" className="h-full w-full object-cover object-top" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-foreground-100 truncate">{p.name}</p>
                    <p className="font-mono text-[10px] tracking-wide text-foreground-500 uppercase">{p.category}</p>
                  </div>
                  <span className="font-mono text-[12px] text-foreground-300 shrink-0">
                    {Number.isInteger(p.price) ? `$${p.price}` : `$${p.price.toFixed(2)}`}
                  </span>
                </Link>
              ))}
              <button
                type="button"
                onClick={() => goToShop(query)}
                className="w-full flex items-center justify-center gap-1.5 px-5 py-3 mt-1 border-t border-background-200/40 font-mono text-[11px] text-primary-500 hover:text-primary-400 transition-colors cursor-pointer"
              >
                See all results for &ldquo;{query}&rdquo;<i className="ri-arrow-right-line text-[12px]"></i>
              </button>
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-[13px] text-foreground-500 mb-3">No compounds match &ldquo;{query}&rdquo;.</p>
              <button
                type="button"
                onClick={() => goToShop(query)}
                className="font-mono text-[11px] text-primary-500 hover:text-primary-400 transition-colors cursor-pointer"
              >
                Search the full shop anyway →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
