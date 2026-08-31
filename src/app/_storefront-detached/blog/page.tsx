import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Research notes, methodology, and what our QA team is learning about purity verification, storage science, and peptide research.",
  alternates: { canonical: "/blog" },
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function BlogPage() {
  const { organizationId } = await getStoreContext();
  const posts = await prisma.page.findMany({
    where: { organizationId, type: "BLOG_POST", published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner /><Header />
      <main>
        <section className="relative pt-[112px] bg-background-900 border-b border-background-200/60">
          <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none"></div>
          <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-primary-500/60"></span>
                <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">Blog</span>
              </div>
              <h1 className="font-display text-[44px] md:text-[60px] leading-[0.95] tracking-tightest text-foreground-100 mb-4 max-w-2xl">
                Research notes, methodology, and what we&#39;re learning.
              </h1>
              <p className="text-[15px] text-foreground-400 max-w-lg">
                Notes from our lab and QA team on purity verification, storage science, and the research our compounds show up in most.
              </p>
            </div>
            <div className="hidden lg:block lg:col-span-5 h-[240px] relative rounded-xl overflow-hidden border border-background-200/60">
              <img
                src="https://images.pexels.com/photos/8531365/pexels-photo-8531365.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Scientist writing notes in a laboratory"
                className="w-full h-full object-cover"
              />
              <div className="photo-fade absolute inset-0 bg-gradient-to-t from-background-900/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-background-900/85 backdrop-blur border border-background-200/50">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></span>
                <span className="font-mono text-[10px] tracking-[0.08em] text-foreground-200 uppercase">New Research Notes, Regularly</span>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-16 md:py-20">
          {posts.length === 0 ? (
            <div className="text-center py-24">
              <i className="ri-article-line text-[32px] text-foreground-600 mb-3 inline-block"></i>
              <p className="text-foreground-400">No posts published yet — add one in the CRM under Content (CMS).</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group relative flex flex-col rounded-xl border border-background-200/60 bg-background-900/70 p-6 hover:border-primary-500/40 transition-all duration-500 ease-precision"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 mb-5 group-hover:bg-primary-500 group-hover:text-background-900 transition-all duration-500">
                    <i className="ri-article-line text-[18px]"></i>
                  </div>
                  <h2 className="font-display text-[19px] leading-snug text-foreground-100 mb-3 group-hover:text-primary-500 transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-[13px] text-foreground-500 leading-relaxed mb-6 flex-1">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-background-200/40">
                    <span className="font-mono text-[10px] text-foreground-600">
                      {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-14 rounded-xl border border-background-200/60 bg-background-900/50 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-[20px] text-foreground-100 mb-1">New posts published regularly.</h3>
              <p className="text-[13px] text-foreground-500">Subscribe below for research notes and new COA batches as they publish.</p>
            </div>
            <Link
              href="/#newsletter"
              className="shrink-0 h-10 px-6 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <i className="ri-mail-line text-[14px]"></i>Subscribe
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
