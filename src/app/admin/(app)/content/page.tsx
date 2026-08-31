import Link from "next/link";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, EmptyState } from "@/components/ui";
import { scoreSeo } from "@/lib/seo-score";
import clsx from "clsx";

export default async function ContentPage() {
  const { organization } = await requireOrg();

  const pages = await prisma.page.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: "desc" },
  });

  const published = pages.filter((p) => p.published).length;

  return (
    <div>
      <PageHeader
        title="Content (CMS)"
        subtitle="Blog posts and static pages for the Vertalis site"
        actions={
          <Link
            href="/admin/content/new"
            className="text-sm bg-cc-primary-500 text-cc-background-50 rounded-md px-3 py-1.5 font-medium hover:bg-cc-primary-600"
          >
            + New page
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total pages" value={String(pages.length)} />
        <StatCard label="Published" value={String(published)} />
        <StatCard label="Drafts" value={String(pages.length - published)} />
      </div>

      {pages.length === 0 ? (
        <EmptyState icon="ri-article-line" title="No content yet" body="Create your first blog post or static page." />
      ) : (
        <div className="rounded-lg border border-cc-background-200 bg-cc-background-50 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-cc-foreground-500 border-b border-cc-background-200">
                <th className="py-2.5 px-4 font-medium">Title</th>
                <th className="py-2.5 px-4 font-medium">Type</th>
                <th className="py-2.5 px-4 font-medium text-center">Status</th>
                <th className="py-2.5 px-4 font-medium text-center">SEO</th>
                <th className="py-2.5 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => {
                const seo = scoreSeo({
                  title: p.title,
                  slug: p.slug,
                  seoTitle: p.seoTitle,
                  seoDescription: p.seoDescription,
                  seoImage: p.seoImage ?? p.coverImage,
                  bodyText: p.body,
                });
                return (
                  <tr key={p.id} className="border-b border-cc-background-100 last:border-0">
                    <td className="py-3 px-4">
                      <Link href={`/admin/content/${p.id}`} className="text-cc-foreground-950 font-medium hover:underline">
                        {p.title}
                      </Link>
                      <div className="text-xs text-cc-foreground-500 font-mono">{p.slug}</div>
                    </td>
                    <td className="py-3 px-4 text-cc-foreground-700">
                      {p.type === "BLOG_POST" ? "Blog post" : "Static page"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.published ? (
                        <span className="text-xs text-cc-primary-600 font-medium">Published</span>
                      ) : (
                        <span className="text-xs text-cc-foreground-500">Draft</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={clsx(
                          "text-xs font-semibold px-1.5 py-0.5 rounded",
                          seo.score >= 85
                            ? "text-cc-primary-600 bg-cc-primary-100"
                            : seo.score >= 60
                            ? "text-cc-secondary-700 bg-cc-secondary-100"
                            : "text-cc-accent-700 bg-cc-accent-100"
                        )}
                      >
                        {seo.score}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/admin/content/${p.id}`} className="text-xs text-cc-primary-600 font-medium hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
