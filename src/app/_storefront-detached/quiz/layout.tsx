import type { Metadata } from "next";

/** app/quiz/page.tsx is a client component, so metadata lives here instead. */
export const metadata: Metadata = {
  title: "Find Your Research Compound",
  description:
    "Answer a couple of quick questions and we'll point you toward the right research peptide or stack for your protocol.",
  alternates: { canonical: "/quiz" },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
