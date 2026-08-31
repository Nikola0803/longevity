"use client";

/**
 * Floating "recent purchase" social-proof toast. On desktop it sits beside
 * the WhatsApp launcher (bottom-6 left-6, 56px circle — see
 * WhatsAppButton.tsx): left-[88px] clears that button with an ~8px gap at
 * the same bottom offset, so the two sit side by side as a pair.
 *
 * On narrow mobile viewports that bottom-left slot plus the WhatsApp button
 * (bottom-6 left-6) and QuizPopup (bottom-6 right-6) all competing for the
 * same 24px-from-bottom strip caused real overlap below ~400px wide
 * screens, so on mobile this renders as a full-width banner just under the
 * fixed header instead (top-[100px] inset-x-4), clearing all three floating
 * elements entirely.
 *
 * Data is illustrative, not a live feed of real orders — same convention as
 * the affiliate tier table (see the comment on TIERS in app/affiliate/page.tsx):
 * cycles through actual catalog products/images, but the buyer name, city,
 * and "N minutes ago" are placeholder examples, not real customer PII. If
 * real anonymized order data is wanted here later, /api/account/orders'
 * pattern (resolve identity server-side, return only what's safe to show)
 * is the template to extend rather than exposing raw order data publicly.
 */

import { useEffect, useState } from "react";
import { PRODUCTS } from "@/data/products";

const SAMPLE_BUYERS = [
  { name: "Jordan K.", city: "Toronto, ON" },
  { name: "Maria S.", city: "Austin, TX" },
  { name: "David L.", city: "Seattle, WA" },
  { name: "Priya R.", city: "Boston, MA" },
  { name: "Chris T.", city: "Denver, CO" },
];

const MINUTES_AGO = [12, 27, 41, 58, 6, 33];

const FEATURED_PRODUCTS = PRODUCTS.filter((p) => !p.hidden && !p.disabled).slice(0, 8);

const SHOW_MS = 7000;
const GAP_MS = 9000;
const FIRST_DELAY_MS = 5000;

export default function RecentPurchaseToast() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (stopped || FEATURED_PRODUCTS.length === 0) return;

    let showTimer: number;
    let hideTimer: number;

    const cycle = () => {
      setVisible(true);
      hideTimer = window.setTimeout(() => {
        setVisible(false);
        showTimer = window.setTimeout(() => {
          setIndex((i) => (i + 1) % FEATURED_PRODUCTS.length);
          cycle();
        }, GAP_MS);
      }, SHOW_MS);
    };

    const first = window.setTimeout(cycle, FIRST_DELAY_MS);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [stopped]);

  if (stopped || FEATURED_PRODUCTS.length === 0) return null;

  const product = FEATURED_PRODUCTS[index];
  const buyer = SAMPLE_BUYERS[index % SAMPLE_BUYERS.length];
  const minutesAgo = MINUTES_AGO[index % MINUTES_AGO.length];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed z-40 top-[100px] inset-x-4 sm:inset-x-auto sm:top-auto sm:bottom-6 sm:left-[88px] sm:w-[min(18rem,calc(100vw-7rem))] transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-2 sm:translate-y-2 opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative flex items-center gap-3 rounded-2xl border border-background-200/60 bg-background-900/95 p-3 pr-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background-100">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-foreground-500">
            <span className="font-semibold text-foreground-200">{buyer.name}</span>
            <span className="text-foreground-600"> · {buyer.city}</span>
          </p>
          <p className="mt-0.5 truncate font-display text-sm font-semibold text-foreground-100">
            {product.name}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-primary-500">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-500/70"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-500"></span>
            </span>
            Purchased {minutesAgo} minutes ago
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setStopped(true)}
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-foreground-500 transition-colors hover:bg-background-200/60 hover:text-foreground-200 cursor-pointer"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
