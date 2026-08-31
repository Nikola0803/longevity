import { notFound } from "next/navigation";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import PageForm from "@/components/page-form";
import { deletePage } from "../actions";

export default async function EditContentPage({ params }: { params: { id: string } }) {
  const { organization } = await requireOrg();
  const page = await prisma.page.findFirst({ where: { id: params.id, organizationId: organization.id } });
  if (!page) notFound();

  return (
    <div>
      <PageHeader
        title={page.title}
        subtitle="Edit page"
        actions={
          <form action={deletePage}>
            <input type="hidden" name="id" value={page.id} />
            <button className="text-sm border border-cc-background-300 rounded-md px-3 py-1.5 text-cc-accent-700 hover:bg-cc-accent-100">
              Delete
            </button>
          </form>
        }
      />
      <PageForm
        initial={{
          id: page.id,
          type: page.type,
          title: page.title,
          slug: page.slug,
          excerpt: page.excerpt ?? "",
          body: page.body,
          coverImage: page.coverImage ?? "",
          published: page.published,
          seoTitle: page.seoTitle ?? "",
          seoDescription: page.seoDescription ?? "",
          seoImage: page.seoImage ?? "",
        }}
      />
    </div>
  );
}
