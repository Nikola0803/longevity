"use client";

import { useMemo, useState } from "react";
import { saveProduct } from "@/app/admin/(app)/products/actions";
import { scoreSeo } from "@/lib/seo-score";
import ImageUploader from "@/components/image-uploader";

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  spec: string;
  purity: string;
  price: number;
  compareAt: number | null;
  cogs: number;
  stock: number;
  inStock: boolean;
  featured: boolean;
  hidden: boolean;
  description: string;
  shortDescription: string;
  images: string[];
  seoTitle: string;
  seoDescription: string;
  seoImage: string;
}

const CATEGORIES = [
  "Peptides",
  "Sprays",
  "Fat Loss & Metabolic",
  "Recovery & Repair",
  "Longevity",
  "Cognitive",
  "Peptide Blends",
  "Research Supplies",
];

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

export default function ProductForm({ initial }: { initial: ProductFormValues }) {
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [description, setDescription] = useState(initial.description);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);
  const [seoImage, setSeoImage] = useState(initial.seoImage);

  const seo = useMemo(
    () =>
      scoreSeo({
        title: name,
        slug,
        seoTitle,
        seoDescription,
        seoImage,
        bodyText: description,
      }),
    [name, slug, seoTitle, seoDescription, seoImage, description]
  );

  const gradeColor =
    seo.grade === "Good"
      ? "text-cc-primary-600 bg-cc-primary-100"
      : seo.grade === "OK"
      ? "text-cc-secondary-700 bg-cc-secondary-100"
      : "text-cc-accent-700 bg-cc-accent-100";

  return (
    <form action={saveProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="lg:col-span-2 space-y-5">
        <div className="rounded-lg border border-cc-background-200 bg-cc-background-50 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-cc-foreground-950">Basics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Product name">
              <input name="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </Field>
            <Field label="URL slug" hint="Used in /product/<slug> — lowercase, hyphens only.">
              <input name="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls} />
            </Field>
            <Field label="SKU" hint="Leave blank to reuse the slug.">
              <input name="sku" defaultValue={initial.sku} className={inputCls} />
            </Field>
            <Field label="Category">
              <select name="category" defaultValue={initial.category} className={inputCls}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Spec" hint='e.g. "10 mg / vial"'>
              <input name="spec" defaultValue={initial.spec} className={inputCls} />
            </Field>
            <Field label="Purity" hint='e.g. "99.52%"'>
              <input name="purity" defaultValue={initial.purity} className={inputCls} />
            </Field>
          </div>
        </div>

        <div className="rounded-lg border border-cc-background-200 bg-cc-background-50 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-cc-foreground-950">Content</h2>
          <Field label="Short description" hint="Shown on category/shop cards.">
            <textarea name="shortDescription" defaultValue={initial.shortDescription} rows={2} className={inputCls} />
          </Field>
          <Field label="Full description" hint="Shown on the product page.">
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={inputCls}
            />
          </Field>
          <Field label="Images" hint="Click or drag to upload. First image is the primary one — hover a thumbnail to change it.">
            <ImageUploader name="images" initial={initial.images} />
          </Field>
        </div>

        <div className="rounded-lg border border-cc-background-200 bg-cc-background-50 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-cc-foreground-950">Pricing & stock</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Price ($)">
              <input name="price" type="number" step="0.01" defaultValue={initial.price} className={inputCls} />
            </Field>
            <Field label="Compare-at ($)" hint="Optional strike-through price.">
              <input name="compareAt" type="number" step="0.01" defaultValue={initial.compareAt ?? ""} className={inputCls} />
            </Field>
            <Field label="Cost (COGS, $)">
              <input name="cogs" type="number" step="0.01" defaultValue={initial.cogs} className={inputCls} />
            </Field>
            <Field label="Stock (units)">
              <input name="stock" type="number" defaultValue={initial.stock} className={inputCls} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm text-cc-foreground-800">
              <input type="checkbox" name="inStock" defaultChecked={initial.inStock} className="rounded" />
              In stock
            </label>
            <label className="flex items-center gap-2 text-sm text-cc-foreground-800">
              <input type="checkbox" name="featured" defaultChecked={initial.featured} className="rounded" />
              Featured (best sellers)
            </label>
            <label className="flex items-center gap-2 text-sm text-cc-foreground-800">
              <input type="checkbox" name="hidden" defaultChecked={initial.hidden} className="rounded" />
              Hidden from storefront
            </label>
          </div>
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
          <Field label="SEO title" hint="Falls back to product name if blank.">
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
          {initial.id ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}
