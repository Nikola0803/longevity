import type { Metadata } from "next";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";

export const metadata: Metadata = {
  title: "Blog",
  description: "Research notes, methodology, and what our QA team is learning about purity verification, storage science, and peptide research.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner /><Header />
      <main className="pt-[96px]">
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-24 text-center">
          <i className="ri-article-line text-[32px] text-foreground-600 mb-3 inline-block"></i>
          <h1 className="font-display text-[32px] text-foreground-100 mb-2">Blog</h1>
          <p className="text-foreground-400">No posts published yet.</p>
        </section>
      </main>
    </div>
  );
}
