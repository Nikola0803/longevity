import type { Config } from "tailwindcss";

// Color tokens ported 1:1 from the original readdy.ai mockup so the rebuilt
// app matches the approved visual design exactly. Each shade references a
// CSS variable (defined in globals.css) holding raw OKLCH L/C/H components.
function scale(name: string) {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  return Object.fromEntries(
    shades.map((s) => [s, `oklch(var(--${name}-${s}) / <alpha-value>)`])
  );
}

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CRM/CMS dashboard palette — prefixed "cc-" (Command Center) so
        // these coexist with the Longevity Peptides storefront's own `background`/
        // `foreground`/`primary`/etc tokens below without either theme
        // clobbering the other now that both live in one Tailwind config.
        "cc-background": scale("cc-background"),
        "cc-foreground": scale("cc-foreground"),
        "cc-primary": scale("cc-primary"),
        "cc-secondary": scale("cc-secondary"),
        "cc-accent": scale("cc-accent"),

        // Longevity Peptides storefront palette (see globals.css :root / [data-theme]
        // for the runtime-swappable --bg-*/--fg-*/etc custom properties).
        background: {
          100: "rgb(var(--bg-100) / <alpha-value>)",
          200: "rgb(var(--bg-200) / <alpha-value>)",
          300: "rgb(var(--bg-300) / <alpha-value>)",
          800: "rgb(var(--bg-800) / <alpha-value>)",
          900: "rgb(var(--bg-900) / <alpha-value>)",
        },
        foreground: {
          100: "rgb(var(--fg-100) / <alpha-value>)",
          200: "rgb(var(--fg-200) / <alpha-value>)",
          300: "rgb(var(--fg-300) / <alpha-value>)",
          400: "rgb(var(--fg-400) / <alpha-value>)",
          500: "rgb(var(--fg-500) / <alpha-value>)",
          600: "rgb(var(--fg-600) / <alpha-value>)",
        },
        primary: {
          400: "rgb(var(--primary-500) / <alpha-value>)",
          500: "rgb(var(--primary-500) / <alpha-value>)",
        },
        secondary: {
          400: "rgb(var(--secondary-500) / <alpha-value>)",
          500: "rgb(var(--secondary-500) / <alpha-value>)",
        },
        accent: {
          200: "rgb(var(--accent-200) / <alpha-value>)",
          300: "rgb(var(--accent-300) / <alpha-value>)",
        },
        signal: "rgb(var(--signal) / <alpha-value>)",
      },
      fontFamily: {
        body: ["var(--font-body)"],
        heading: ["var(--font-heading)"],
        mono: ["var(--font-jetbrains-mono)", "var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-inter)", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      transitionTimingFunction: {
        precision: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scan-line": {
          "0%": { opacity: "0", transform: "translateY(-100%)" },
          "20%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(400%)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scan-line": "scan-line 2.4s ease-in-out infinite",
        "slide-in": "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "spin-slow": "spin 24s linear infinite",
        "spin-slower": "spin 40s linear infinite",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
