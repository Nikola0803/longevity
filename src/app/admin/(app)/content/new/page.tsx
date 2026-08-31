import { PageHeader } from "@/components/ui";
import PageForm from "@/components/page-form";

export default function NewContentPage() {
  return (
    <div>
      <PageHeader title="New page" subtitle="Add a blog post or static page" />
      <PageForm
        initial={{
          type: "BLOG_POST",
          title: "",
          slug: "",
          excerpt: "",
          body: "",
          coverImage: "",
          published: false,
          seoTitle: "",
          seoDescription: "",
          seoImage: "",
        }}
      />
    </div>
  );
}
