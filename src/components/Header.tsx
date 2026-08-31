"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useRegion, REGIONS, type RegionCode } from "@/lib/region";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const { count, openCart } = useCart();
  const { region, setRegion } = useRegion();

  return (
    <header className="sticky top-0 z-40 bg-background-800/90 backdrop-blur border-b border-background-200/60">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <span className="absolute inset-0 rounded-lg border border-primary-500/50 rotate-45"></span>
            <span className="absolute inset-[6px] rounded-md bg-primary-500/10 rotate-45"></span>
            <span className="relative w-1.5 h-1.5 rounded-full bg-primary-500"></span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[17px] tracking-[0.2em] text-foreground-100">VERTALIS</span>
            <span className="font-mono text-[7px] tracking-[0.35em] text-foreground-500 uppercase mt-0.5">Longevity Lab</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[13px] text-foreground-300 hover:text-primary-500 transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as RegionCode)}
            className="hidden sm:block bg-background-100 border border-background-200 rounded-md text-[12px] text-foreground-300 px-2 py-1.5 focus:outline-none focus:border-primary-500"
            aria-label="Region"
          >
            {Object.values(REGIONS).map((r) => (
              <option key={r.code} value={r.code}>
                {r.flag} {r.currency}
              </option>
            ))}
          </select>
          <button
            onClick={openCart}
            className="relative w-9 h-9 flex items-center justify-center rounded-md bg-background-100 text-foreground-300 hover:text-primary-500 transition-colors"
            aria-label="Cart"
          >
            <i className="ri-shopping-bag-3-line text-[16px]"></i>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-500 text-background-800 text-[9px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
