import type { Metadata } from "next";
import VerifyClient from "@/components/VerifyClient";
import { getCatalogProductBySlug } from "@/lib/storefront-catalog";
import { getLatestCoaForProduct } from "@/data/coa-records";

const SITE_URL = "https://longevitypeptides.com";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) return { title: "Batch Verification" };

  const coa = getLatestCoaForProduct(product.name);
  const title = `Verify ${product.name} · Batch Certificate`;
  const description = coa
    ? `Independent COA for ${product.name}: batch ${coa.batchCode}, ${coa.purity} purity, tested ${coa.testDate}.`
    : `Scan-to-verify batch page for ${product.name}, a Longevity Peptides research peptide.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/verify/${product.slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function VerifyPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  return <VerifyClient slug={slug} />;
}
