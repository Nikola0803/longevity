"use client";

import { useEffect, useState } from "react";

/**
 * Dark/light theme switch. The actual color values live in CSS custom
 * properties (app/globals.css :root / [data-theme="light"]), read through
 * tailwind.config.ts — this component only ever flips the [data-theme]
 * attribute on <html> and remembers the choice in localStorage.
 *
 * The anti-flash inline script in app/layout.tsx sets [data-theme] before
 * hydration, so this component's initial useState read of the DOM (rather
 * than defaulting to a hardcoded guess) keeps the icon in sync with
 * whatever the script already applied, with no flicker.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("vertalis-theme", next);
    } catch {
      /* storage unavailable (e.g. privacy mode) — theme still applies for this load */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="flex w-9 h-9 items-center justify-center rounded-md text-foreground-300 hover:text-primary-500 hover:bg-background-200/60 transition-colors cursor-pointer"
    >
      <i className={theme === "dark" ? "ri-sun-line text-[17px]" : "ri-moon-line text-[17px]"}></i>
    </button>
  );
}
