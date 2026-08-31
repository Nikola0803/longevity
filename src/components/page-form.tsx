"use client";

import { useMemo, useState } from "react";
import { savePage } from "@/app/admin/(app)/content/actions";
import { scoreSeo } from "@/lib/seo-score";
import ImageUploader from "@/components/image-uploader";

export interface PageFormValues {
  id?: string;
  type: "BLOG_POST" | "STATIC_PAGE";
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
  seoImage: string;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-cc-foreground-700 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-cc-foreground-500 mt-1">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500";

export default function PageForm({ initial }: { initial: PageFormValues }) {
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [body, setBody] = useState(initial.body);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);
  const [seoImage, setSeoImage] = useState(initial.seoImage);

  const seo = useMemo(
    () => scoreSeo({ title, slug, seoTitle, seoDescription, seoImage, bodyText: body }),
    [title, slug, seoTitle, seoDescription, seoImage, body]
  );

  const gradeColor =
    seo.grade === "Good"
      ? "text-cc-primary-600 bg-cc-primary-100"
      : seo.grade === "OK"
      ? "text-cc-secondary-700 bg-cc-secondary-100"
      : "text-cc-accent-700 bg-cc-accent-100";

  return (
    <form action={savePage} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="lg:col-span-2 space-y-5">
        <div className="rounded-lg border border-cc-background-200 bg-cc-background-50 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-cc-foreground-950">Content</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title">
              <input name="title" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
            </Field>
            <Field label="URL slug" hint="Blog posts: /blog/<slug>. Static pages: matched by page slug.">
              <input name="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Type">
            <select name="type" defaultValue={initial.type} className={inputCls}>
              <option value="BLOG_POST">Blog post</option>
              <option value="STATIC_PAGE">Static page</option>
            </select>
          </Field>
          <Field label="Excerpt" hint="Shown on the blog listing card.">
            <textarea name="excerpt" defaultValue={initial.excerpt} rows={2} className={inputCls} />
          </Field>
          <Field label="Body" hint="Plain text / HTML. A rich text editor can replace this later without changing the schema.">
            <textarea name="body" value={body} onChange={(e) => setBody(e.target.value)} rows={14} className={`${inputCls} font-mono text-xs`} />
          </Field>
          <Field label="Cover image">
            <ImageUploader name="coverImage" initial={initial.coverImage ? [initial.coverImage] : []} max={1} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-cc-foreground-800">
            <input type="checkbox" name="published" defaultChecked={initial.published} className="rounded" />
            Published (visible on the live site)
          </label>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-lg border border-cc-background-200 bg-cc-background-50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-cc-foreground-950">SEO</h2>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${gradeColor}`}>
              {seo.score}/100 · {seo.grade}
            </span>
          </div>
          <Field label="SEO title" hint="Falls back to the page title if blank.">
            <input name="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Meta description">
            <textarea
              name="seoDescription"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={3}
              className={inputCls}
            />
          </Field>
          <Field label="Social share image URL">
            <input name="seoImage" value={seoImage} onChange={(e) => setSeoImage(e.target.value)} className={inputCls} />
          </Field>
          <ul className="space-y-1.5 pt-2 border-t border-cc-background-200">
            {seo.checks.map((c) => (
              <li key={c.id} className="flex items-start gap-2 text-xs">
                <i className={c.pass ? "ri-checkbox-circle-fill text-cc-primary-600 mt-0.5" : "ri-close-circle-line text-cc-accent-600 mt-0.5"} />
                <span className={c.pass ? "text-cc-foreground-600" : "text-cc-foreground-800"}>
                  {c.label}
                  {!c.pass && <span className="block text-cc-foreground-500">{c.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-cc-primary-500 text-cc-background-50 text-sm font-medium py-2.5 hover:bg-cc-primary-600 transition-colors"
        >
          {initial.id ? "Save changes" : "Create page"}
        </button>
      </div>
    </form>
  );
}
