import type { Metadata } from "next";
import ProductPageClient from "@/components/ProductPageClient";
import { getAllCatalogProducts, getCatalogProductBySlug } from "@/lib/storefront-catalog";
import { getRating } from "@/lib/product-types";

const SITE_URL = "https://longevitypeptides.com";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getCatalogProductBySlug(params.slug);
  if (!product) return {};

  const title = `${product.name} (${product.spec}) · ${product.purity} Purity`;
  const description =
    product.description ||
    `${product.name} (${product.spec}) research peptide, ${product.purity} purity, independently third-party tested. Public Certificate of Analysis, lyophilized and shipped ambient.`;
  const url = `${SITE_URL}/product/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: [{ url: product.image, width: 800, height: 1000, alt: product.imgAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [product.image] },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const products = await getAllCatalogProducts();
  const product = products.find((p) => p.slug === slug);

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: `${product.name} (${product.spec})`,
        description:
          product.description ??
          `${product.name} (${product.spec}) research peptide, ${product.purity} purity, independently third-party tested.`,
        image: `${SITE_URL}${product.image}`,
        sku: product.slug.toUpperCase(),
        brand: { "@type": "Brand", name: "LONGEVITY PEPTIDES" },
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/product/${product.slug}`,
          priceCurrency: "AUD",
          price: product.price,
          availability: product.disabled ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        },
        aggregateRating: (() => {
          const r = getRating(product);
          return { "@type": "AggregateRating", ratingValue: r.stars, reviewCount: r.count };
        })(),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <ProductPageClient slug={slug} />
    </>
  );
}
