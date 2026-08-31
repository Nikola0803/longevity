import Link from "next/link";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { dateTime } from "@/lib/format";

export default async function BlogToolPage() {
  const { organization } = await requireOrg();

  const posts = await prisma.page.findMany({
    where: { organizationId: organization.id, type: "BLOG_POST" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div>
      <PageHeader
        title="AI Blog Tool"
        subtitle="Drafts publish straight into Content (CMS) — same posts that show on /blog"
        actions={
          <Link href="/admin/content/new" className="text-sm bg-cc-primary-500 text-cc-background-50 rounded-md px-3 py-1.5 font-medium hover:bg-cc-primary-600">
            + Write a post
          </Link>
        }
      />

      <Card className="p-4 mb-6">
        <h2 className="text-sm font-semibold text-cc-foreground-950 mb-2">AI drafting</h2>
        <p className="text-sm text-cc-foreground-600 leading-relaxed">
          There's no separate blog system to keep in sync — posts written here (or drafted by an AI writer once one's
          wired in) land in the same Content section under Products/Content in the sidebar, and publish straight to
          <span className="font-mono"> longevitypeptides.com/blog</span>. Auto-generating drafts grounded in your product
          catalog needs an LLM API key (OpenAI/Anthropic) connected server-side — tell me which provider you want and
          I'll wire a "Generate draft" button right into the editor.
        </p>
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-cc-foreground-950 mb-3">Recent posts</h2>
        {posts.length === 0 ? (
          <EmptyState icon="ri-article-line" title="No posts yet" body="Write your first post — it'll show up here and on the live blog once published." />
        ) : (
          <div className="rounded-lg border border-cc-background-200 bg-cc-background-50 divide-y divide-cc-background-100">
            {posts.map((p) => (
              <Link key={p.id} href={`/admin/content/${p.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-cc-background-100/60">
                <div>
                  <div className="text-sm font-medium text-cc-foreground-950">{p.title}</div>
                  <div className="text-xs text-cc-foreground-500">{dateTime(p.createdAt)}</div>
                </div>
                <span className={`text-xs font-medium ${p.published ? "text-cc-primary-700" : "text-cc-foreground-500"}`}>
                  {p.published ? "Published" : "Draft"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
