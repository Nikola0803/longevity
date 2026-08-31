import Link from "next/link";
import { PageHeader } from "@/components/ui";
import ProductForm from "@/components/product-form";

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-xs text-cc-foreground-500 hover:text-cc-foreground-800 mb-3">
        <i className="ri-arrow-left-line" /> Back to products
      </Link>
      <PageHeader title="New product" subtitle="Add a product to the Longevity Peptides catalog" />
      <ProductForm
        initial={{
          name: "",
          slug: "",
          sku: "",
          category: "Peptides",
          spec: "",
          purity: "",
          price: 0,
          compareAt: null,
          cogs: 0,
          stock: 0,
          inStock: true,
          featured: false,
          hidden: false,
          description: "",
          shortDescription: "",
          images: [],
          seoTitle: "",
          seoDescription: "",
          seoImage: "",
        }}
      />
    </div>
  );
}
