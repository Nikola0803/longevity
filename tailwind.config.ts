import type { Config } from "tailwindcss";

// Color tokens read off CSS variables defined once in globals.css (light
// palette only — no [data-theme] runtime switch, no dark values, no CRM
// "cc-" scale, since this app has no admin dashboard).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
