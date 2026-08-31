"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BannerMessage =
  | { type: "code"; label: string; code: string; suffix: string }
  | { type: "text"; label: string; href?: string }
  | { type: "cta"; label: string; ctaLabel: string; ctaHref: string };

const MESSAGES: BannerMessage[] = [
  {
    type: "code",
    label: "Use code",
    code: "WELCOME10",
    suffix: "for 10% off your first order, tap to copy",
  },
  { type: "text", label: "Want to know about our standards?", href: "/quality" },
  { type: "text", label: "Third-party COA on every batch, no exceptions", href: "/coa" },
  { type: "text", label: "Fast US shipping on every order" },
  {
    type: "cta",
    label: "Active Military, Veterans & First Responders: 23% Off for Life. See how we honor your service.",
    ctaLabel: "Learn More",
    ctaHref: "/veterans",
  },
];

const ROTATE_MS = 4200;
const FADE_MS = 250;

/**
 * PromoBanner: persistent strip above the main navbar.
 * Rotates through MESSAGES, starting at a random index and advancing on an
 * interval. Fixed height (h-10 / 40px) so Header.tsx can sit at a known
 * top-10 offset and every page's pt-[112px] (72px header + 40px banner)
 * lines up.
 */
export default function PromoBanner() {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  // Randomize the starting message only after mount (avoids SSR/client mismatch).
  useEffect(() => {
    setIndex(Math.floor(Math.random() * MESSAGES.length));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [ready]);

  const current = MESSAGES[index];

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable (e.g. insecure context). Code is still readable to copy manually.
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-10 bg-background-900 border-b border-primary-500/15">
      <div className="relative w-full h-full flex items-center justify-center px-4">
        <div
          className={`flex items-center justify-center max-w-full overflow-x-auto no-scrollbar whitespace-nowrap transition-opacity ease-precision ${
            ready && visible ? "opacity-100 duration-300" : "opacity-0 duration-150"
          }`}
        >
          {current.type === "code" && (
            <button
              type="button"
              onClick={() => handleCopy(current.code)}
              aria-label={`Copy promo code ${current.code}`}
              className="group flex items-center gap-2 text-[11px] md:text-[12px] text-foreground-400 tracking-wide cursor-pointer"
            >
              <span>{current.label}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-primary-500/50 px-2.5 py-0.5 font-mono font-semibold tracking-[0.12em] text-primary-500 group-hover:bg-primary-500 group-hover:text-background-900 transition-colors duration-300 ease-precision">
                {copied ? "COPIED ✓" : current.code}
              </span>
              <span>{current.suffix}</span>
            </button>
          )}

          {current.type === "text" &&
            (current.href ? (
              <Link
                href={current.href}
                className="flex items-center gap-1.5 text-[11px] md:text-[12px] text-foreground-400 hover:text-primary-500 tracking-wide transition-colors duration-300 ease-precision"
              >
                {current.label}
                <i className="ri-arrow-right-line text-[12px]"></i>
              </Link>
            ) : (
              <span className="text-[11px] md:text-[12px] text-foreground-400 tracking-wide">
                {current.label}
              </span>
            ))}

          {current.type === "cta" && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] md:text-[12px] text-foreground-400 tracking-wide">
                {current.label}
              </span>
              <Link
                href={current.ctaHref}
                className="inline-flex items-center gap-1 rounded-full border border-primary-500/50 px-2.5 py-0.5 font-mono font-semibold tracking-[0.1em] text-[10px] text-primary-500 hover:bg-primary-500 hover:text-background-900 transition-colors duration-300 ease-precision shrink-0"
              >
                {current.ctaLabel}
              </Link>
            </div>
          )}
        </div>

        {/* Rotation indicator dots */}
        <div className="hidden sm:flex items-center gap-1 absolute right-4 top-1/2 -translate-y-1/2">
          {MESSAGES.map((_, i) => (
            <span
              key={i}
              className={`w-1 h-1 rounded-full transition-colors duration-300 ease-precision ${
                i === index ? "bg-primary-500" : "bg-foreground-600/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
