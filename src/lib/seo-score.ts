/**
 * Lightweight, dependency-free SEO grading — the same handful of checks a
 * Yoast/RankMath-style widget runs, scored out of 100. Not a substitute for
 * real search-console data, but catches the common on-page mistakes
 * (missing title, no meta description, no image, unfriendly slug) before a
 * product or post goes live. Used by both the Products and Content
 * (CMS pages) admin editors — see components in each.
 */

export interface SeoCheckInput {
  title: string;
  slug: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImage?: string | null;
  bodyText?: string | null; // description / body copy, for length + keyword-in-body checks
}

export interface SeoCheck {
  id: string;
  label: string;
  pass: boolean;
  weight: number;
  hint: string;
}

export interface SeoScoreResult {
  score: number; // 0-100
  grade: "Good" | "OK" | "Needs work" | "Poor";
  checks: SeoCheck[];
}

function len(s?: string | null) {
  return (s ?? "").trim().length;
}

export function scoreSeo(input: SeoCheckInput): SeoScoreResult {
  const effectiveTitle = input.seoTitle || input.title;
  const checks: SeoCheck[] = [
    {
      id: "title-present",
      label: "SEO title set",
      pass: len(effectiveTitle) > 0,
      weight: 15,
      hint: "Add a page/product title — falls back to the display name if left blank.",
    },
    {
      id: "title-length",
      label: "SEO title length (30–60 chars)",
      pass: len(effectiveTitle) >= 30 && len(effectiveTitle) <= 60,
      weight: 15,
      hint: "Aim for 30–60 characters so it doesn't get truncated in search results.",
    },
    {
      id: "description-present",
      label: "Meta description set",
      pass: len(input.seoDescription) > 0,
      weight: 15,
      hint: "Write a one or two sentence summary — this is what shows under the title on Google.",
    },
    {
      id: "description-length",
      label: "Meta description length (70–160 chars)",
      pass: len(input.seoDescription) >= 70 && len(input.seoDescription) <= 160,
      weight: 15,
      hint: "70–160 characters is the sweet spot before search engines truncate it.",
    },
    {
      id: "image-present",
      label: "Social/share image set",
      pass: len(input.seoImage) > 0,
      weight: 15,
      hint: "Add an image so links shared on social media/iMessage show a preview card.",
    },
    {
      id: "slug-friendly",
      label: "URL slug is clean",
      pass: /^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug || ""),
      weight: 10,
      hint: "Use lowercase words separated by hyphens, no spaces or special characters.",
    },
    {
      id: "slug-length",
      label: "URL slug isn't too long",
      pass: len(input.slug) > 0 && len(input.slug) <= 60,
      weight: 5,
      hint: "Keep URLs short and readable.",
    },
    {
      id: "body-length",
      label: "Has enough real content",
      pass: len(input.bodyText) >= 120,
      weight: 10,
      hint: "Search engines favor pages with substantive copy — aim for 120+ characters minimum, more is better.",
    },
  ];

  const score = Math.round(checks.reduce((sum, c) => sum + (c.pass ? c.weight : 0), 0));
  const grade: SeoScoreResult["grade"] = score >= 85 ? "Good" : score >= 60 ? "OK" : score >= 35 ? "Needs work" : "Poor";

  return { score, grade, checks };
}
