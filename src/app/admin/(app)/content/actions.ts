"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { PageType } from "@prisma/client";

function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function savePage(formData: FormData) {
  const { organization } = await requireOrg();

  const id = str(formData, "id");
  const title = str(formData, "title") ?? "Untitled";
  const slug = slugify(str(formData, "slug") ?? title);
  const type = (str(formData, "type") ?? "BLOG_POST") as PageType;
  const published = formData.get("published") === "on";

  const data = {
    organizationId: organization.id,
    type,
    slug,
    title,
    excerpt: str(formData, "excerpt"),
    body: str(formData, "body") ?? "",
    coverImage: str(formData, "coverImage"),
    published,
    publishedAt: published ? new Date() : null,
    seoTitle: str(formData, "seoTitle"),
    seoDescription: str(formData, "seoDescription"),
    seoImage: str(formData, "seoImage"),
  };

  if (id) {
    await prisma.page.update({ where: { id }, data });
  } else {
    await prisma.page.create({ data });
  }

  revalidatePath("/admin/content");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/admin/content");
}

export async function deletePage(formData: FormData) {
  const { organization } = await requireOrg();
  const id = str(formData, "id");
  if (!id) return;

  await prisma.page.deleteMany({ where: { id, organizationId: organization.id } });

  revalidatePath("/admin/content");
  revalidatePath("/blog");
}
