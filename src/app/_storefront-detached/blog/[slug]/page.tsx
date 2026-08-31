import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";

const SITE_URL = "https://vertalispeptides.com";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  const { organizationId } = await getStoreContext();
  return prisma.page.findFirst({
    where: { organizationId, slug, type: "BLOG_POST", published: true },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return {};

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || undefined;
  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      images: post.seoImage || post.coverImage ? [{ url: (post.seoImage || post.coverImage)! }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner /><Header />
      <main>
        <section className="pt-[112px] bg-background-900 border-b border-background-200/60">
          <div className="w-full max-w-[820px] mx-auto px-6 md:px-10 py-14">
            <nav className="flex items-center gap-2 text-[12px] text-foreground-500 font-mono mb-6">
              <Link href="/blog" className="hover:text-primary-500 transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-primary-500 truncate">{post.title}</span>
            </nav>
            <h1 className="font-display text-[34px] md:text-[46px] leading-[1.02] tracking-tightest text-foreground-100 mb-4">
              {post.title}
            </h1>
            {post.excerpt && <p className="text-[15px] text-foreground-400 leading-relaxed">{post.excerpt}</p>}
          </div>
        </section>

        {post.coverImage && (
          <div className="w-full max-w-[820px] mx-auto px-6 md:px-10 -mt-6">
            <div className="rounded-xl overflow-hidden border border-background-200/60 aspect-[16/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <section className="w-full max-w-[820px] mx-auto px-6 md:px-10 py-14">
          <div
            className="prose prose-invert max-w-none text-[15px] text-foreground-300 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
          <div className="mt-14 pt-8 border-t border-background-200/60">
            <Link href="/blog" className="inline-flex items-center gap-2 text-[13px] text-primary-500 hover:text-primary-400 transition-colors">
              <i className="ri-arrow-left-line text-[14px]"></i>Back to all posts
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
