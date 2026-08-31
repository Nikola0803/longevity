import "server-only";
import { getCurrentBrand } from "@/lib/store-context";

/**
 * Per-brand theming with zero component churn.
 *
 * The storefront's Tailwind palette already resolves every colour from a CSS
 * variable (see globals.css: `--primary-500`, `--bg-800`, `--fg-100`, ...).
 * So a reseller's theme is nothing more than a map of those same variable
 * names to their own RGB triplets, injected as a `:root { ... }` override that
 * wins over globals.css. Every button, card, gradient, and glow re-tints with
 * no edits to any component.
 *
 * Token shape stored in Brand.themeTokens (all keys optional, anything absent
 * falls back to the Longevity Peptides default from globals.css):
 *
 *   {
 *     "colors": {
 *       "primary-500":   "92 200 160",   // space-separated RGB, matching globals.css
 *       "secondary-500": "70 150 140",
 *       "accent-200":    "210 230 224",
 *       "accent-300":    "150 200 185",
 *       "bg-800":        "10 18 16",
 *       "bg-900":        "6 12 11",
 *       "bg-100":        "18 30 26",
 *       "bg-200":        "26 42 36",
 *       "bg-300":        "36 56 48",
 *       "fg-100":        "228 240 235",
 *       "signal":        "255 110 90"
 *     }
 *   }
 */

// Only these variables may be overridden per brand, keeps a bad token payload
// from injecting arbitrary CSS, and documents exactly what's themeable.
const ALLOWED_VARS = new Set([
  "bg-100", "bg-200", "bg-300", "bg-800", "bg-900",
  "fg-100", "fg-200", "fg-300", "fg-400", "fg-500", "fg-600",
  "primary-500", "secondary-500",
  "accent-200", "accent-300",
  "signal",
]);

// "140 178 224" or "140,178,224" -> "140 178 224"; anything else is dropped.
function sanitizeTriplet(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const parts = raw.trim().split(/[\s,]+/).map((n) => Number(n));
  if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return null;
  }
  return parts.join(" ");
}

export type BrandTheme = {
  /** A `:root { --x: ...; }` string, or "" when the brand uses stock Longevity Peptides colours. */
  css: string;
  /** True when this brand overrides at least one variable. */
  hasOverrides: boolean;
};

export async function getBrandTheme(): Promise<BrandTheme> {
  let tokens: unknown;
  try {
    tokens = (await getCurrentBrand()).themeTokens;
  } catch {
    return { css: "", hasOverrides: false };
  }

  const colors =
    tokens && typeof tokens === "object" && "colors" in (tokens as Record<string, unknown>)
      ? (tokens as { colors?: Record<string, unknown> }).colors
      : undefined;

  if (!colors || typeof colors !== "object") return { css: "", hasOverrides: false };

  const decls: string[] = [];
  for (const [key, val] of Object.entries(colors)) {
    if (!ALLOWED_VARS.has(key)) continue;
    const triplet = sanitizeTriplet(val);
    if (triplet) decls.push(`--${key}: ${triplet};`);
  }

  if (decls.length === 0) return { css: "", hasOverrides: false };
  // `:root,[data-theme]` so the brand palette wins over globals.css in BOTH
  // the default and the [data-theme="light"] block (equal specificity, later
  // in source order wins).
  return { css: `:root,[data-theme]{${decls.join("")}}`, hasOverrides: true };
}
