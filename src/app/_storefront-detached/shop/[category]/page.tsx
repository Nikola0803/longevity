import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import ProductCard from "@/components/ProductCard";
import { getAllCatalogProducts } from "@/lib/catalog";

const SITE_URL = "https://vertalispeptides.com";

const SLUG_TO_CATEGORY: Record<string, string> = {
  "peptides": "Peptides",
  "fat-loss-metabolic": "Fat Loss & Metabolic",
  "recovery-repair": "Recovery & Repair",
  "longevity": "Longevity",
  "cognitive": "Cognitive",
  "peptide-blends": "Peptide Blends",
  "research-supplies": "Research Supplies",
};

const CATEGORY_DESC: Record<string, string> = {
  "Peptides": "High-purity peptide sequences for receptor binding and signaling pathway research.",
  "Fat Loss & Metabolic": "GLP-1 receptor agonists, lipolytic sequences, and metabolic pathway research compounds.",
  "Recovery & Repair": "Tissue repair, wound healing, and regenerative signaling compounds for laboratory research.",
  "Longevity": "Cellular, mitochondrial, and telomere research peptides for longevity science.",
  "Cognitive": "Neurotropic sequences for synaptic plasticity, BDNF signaling, and cognitive research.",
  "Peptide Blends": "Precision-formulated multi-compound blends for complex research protocols.",
  "Research Supplies": "Bacteriostatic water for peptide reconstitution.",
};

/** 2–3 sentence intro shown above the product grid, keyword-led. */
const CATEGORY_INTRO: Record<string, string> = {
  "Peptides": "Vertalis stocks a wide range of research peptides for laboratory use, spanning metabolic, regenerative, cognitive, and longevity research. Every research peptide listed here ships lyophilized with a published, batch-searchable Certificate of Analysis. Whether you're sourcing a single sequence or comparing purity across suppliers, every batch is independently verified before it's listed.",
  "Fat Loss & Metabolic": "Our weight loss peptides and metabolic research compounds include GLP-1 and dual/triple-agonist sequences studied for appetite regulation, lipolysis, and energy expenditure. These fat loss peptides, including Semaglutide, Tirzepatide, and Retatrutide research compounds, are among the most requested sequences in current metabolic research. Every vial is independently tested for purity and identity before listing.",
  "Recovery & Repair": "Our recovery peptides and tissue-repair research compounds, including BPC-157 and TB-500, are studied extensively for their role in wound healing, connective tissue, and regenerative signaling research. These healing peptides are supplied lyophilized and sealed under inert atmosphere for maximum stability. Every batch carries a public, independently verified Certificate of Analysis.",
  "Longevity": "Our longevity peptides and anti-aging research compounds cover cellular energy, mitochondrial function, and telomere-related signaling pathways. Sequences like NAD+, Epitalon, and GHK-Cu are widely studied in longevity science and cellular-repair research. Every longevity research peptide is third-party tested and shipped with a published COA.",
  "Cognitive": "Our cognitive peptides and nootropic research compounds are studied for synaptic plasticity, BDNF signaling, and neuroprotective pathways. Sequences like Semax and Selank are among the most-cited nootropic peptides in current neuroscience research. Every batch is independently verified for purity before it reaches the catalog.",
  "Peptide Blends": "Our peptide blends and pre-formulated peptide stacks combine multiple research compounds into a single vial for complex, multi-pathway research protocols. Each peptide stack, from recovery-focused combinations to skin and longevity blends, is manufactured and tested to the same standard as our single-compound peptides. Every blend ships with its own batch-specific Certificate of Analysis.",
  "Research Supplies": "Bacteriostatic water is the standard diluent used to reconstitute lyophilized research peptides for laboratory use. Our USP-grade bacteriostatic water is supplied in multiple volumes to match your reconstitution and dosing-calculation needs. It ships alongside your peptide order or on its own, with the same next-day dispatch as the rest of the catalog.",
};

/**
 * Longer keyword-rich content block shown below the product grid, per the
 * standard ecommerce-category SEO pattern (short/long-tail keyword coverage
 * in readable prose rather than a raw keyword list). Written as real
 * sentences, not stuffed, so it reads fine for a human who scrolls past
 * the grid, but still covers the terms researchers actually search.
 */
const CATEGORY_SEO_BLOCK: Record<string, { heading: string; paragraphs: string[] }> = {
  "Peptides": {
    heading: "Buying Research Peptides Online",
    paragraphs: [
      "Researchers searching for research peptides for sale online are usually trying to solve the same problem: how do you verify purity before you buy, not after? Vertalis publishes a batch-searchable Certificate of Analysis for every research peptide in the catalog, covering HPLC purity, identity confirmation, and endotoxin screening, so the question of \"how pure is this peptide\" has a documented answer rather than a marketing claim.",
      "Common search terms researchers use when comparing suppliers include high purity research peptides, third-party tested peptides, lyophilized research peptides, USA research peptide supplier, peptide COA lookup, and buy research peptides online. Whether you're looking for a single sequence or comparing multiple research peptide vendors on purity and documentation, every compound on this page is independently verified, lyophilized for stability, and shipped ambient with no cold-chain courier required.",
      "Vertalis peptides are supplied strictly for laboratory and in-vitro research use. Nothing on this page is intended for human consumption, and no dosing or administration guidance is provided.",
    ],
  },
  "Fat Loss & Metabolic": {
    heading: "Weight Loss & Metabolic Research Peptides",
    paragraphs: [
      "GLP-1 receptor agonists have become the most heavily researched class of weight loss peptides in recent years, and Semaglutide research peptide, Tirzepatide research peptide, and Retatrutide research peptide are consistently among the most-searched compounds in metabolic science. Researchers studying these sequences are typically evaluating receptor binding, appetite-regulation pathways, and lipolytic signaling, not sourcing a consumer product, and the purity documentation behind each vial matters accordingly.",
      "Search terms that bring researchers to this category include buy weight loss peptides online, GLP-1 research peptides, fat loss peptide stack, Semaglutide purity test, Tirzepatide COA, metabolic research compounds, and dual agonist research peptides. Every compound listed here, including MOTS-c and AOD-9604, ships lyophilized with a published Certificate of Analysis confirming purity and identity before dispatch.",
      "These compounds are sold strictly for laboratory research. They are not weight loss products, dietary supplements, or medications, and are not intended for human use.",
    ],
  },
  "Recovery & Repair": {
    heading: "Tissue Repair & Recovery Research Peptides",
    paragraphs: [
      "BPC-157 and TB-500 are the two most widely cited recovery peptides in current tissue-repair literature, studied for their role in wound healing, angiogenesis, and cellular migration research. Researchers comparing recovery peptide suppliers typically look at purity consistency across batches and whether a Certificate of Analysis is actually published, not just claimed.",
      "Common searches that lead researchers to this category include healing peptides for sale, BPC-157 purity test, TB-500 research peptide, tissue repair peptide stack, wound healing research compounds, and third-party tested recovery peptides. This category also includes CJC-1295, Ipamorelin, KPV, and the Wolverine Blend (BPC-157 and TB-500 combined), all independently verified and shipped lyophilized.",
      "All compounds in this category are supplied for laboratory research only, not for human or veterinary use, and not as a treatment for any condition.",
    ],
  },
  "Longevity": {
    heading: "Longevity & Anti-Aging Research Peptides",
    paragraphs: [
      "Longevity peptides research spans cellular energy metabolism, mitochondrial function, and telomere-related signaling, areas where compounds like NAD+, Epitalon, and GHK-Cu show up repeatedly in the literature. Researchers in this space are usually comparing purity and stability across suppliers, since degradation or contamination can meaningfully skew longevity-focused assay results.",
      "Search terms associated with this category include anti-aging research peptides, NAD+ purity test, Epitalon research compound, GHK-Cu copper peptide, cellular longevity research, mitochondrial peptide research, and telomere research compounds. Every longevity peptide here is lyophilized, sealed under inert atmosphere, and independently tested before it's listed.",
      "These compounds are intended strictly for laboratory research and are not marketed or sold as anti-aging treatments, supplements, or therapeutics.",
    ],
  },
  "Cognitive": {
    heading: "Nootropic & Cognitive Research Peptides",
    paragraphs: [
      "Cognitive research peptides such as Semax and Selank are frequently cited in neurotrophic and BDNF-signaling research, alongside Oxytocin for social-behavior and neuroendocrine studies. Researchers sourcing nootropic peptides for sale typically want documented purity and identity confirmation before running receptor-binding or signaling-pathway work.",
      "Searches that lead to this category include buy nootropic peptides, Semax research compound, Selank purity test, BDNF research peptides, cognitive function research compounds, and neuropeptide research supplier. Every compound in this category is independently HPLC and mass-spec verified, with a public Certificate of Analysis searchable by batch code.",
      "These research peptides are supplied for laboratory and in-vitro research only and are not intended for human consumption or cognitive enhancement use.",
    ],
  },
  "Peptide Blends": {
    heading: "Peptide Blends & Research Stacks",
    paragraphs: [
      "Peptide blends combine two or more research compounds into a single vial for researchers running multi-pathway protocols without managing separate reconstitution schedules. Popular peptide stacks in this category include the CJC-1295/Ipamorelin blend for combined growth-hormone secretagogue research, the Wolverine Blend (BPC-157 and TB-500) for tissue-repair protocols, and GLOW and KLOW for skin and regenerative-signaling research.",
      "Researchers searching for pre-mixed peptide stacks, combination research peptides, growth hormone secretagogue blends, or multi-compound research vials will find every blend manufactured and tested to the same standard as our single-compound peptides, purity-verified and published by batch code.",
      "All blends are supplied strictly for laboratory research use and are not intended for human administration.",
    ],
  },
  "Research Supplies": {
    heading: "Bacteriostatic Water & Reconstitution Supplies",
    paragraphs: [
      "Bacteriostat water for peptides is the standard USP-grade diluent used to reconstitute lyophilized research compounds before laboratory use, and getting the volume right matters for concentration and dosing-calculation accuracy in a research protocol. We supply it in 5 mL, 10 mL, and 30 mL vials to match different reconstitution needs.",
      "Common searches include bacteriostatic water for research peptides, peptide reconstitution supplies, USP grade bacteriostatic water, and where to buy bacteriostatic water online. It ships alongside a peptide order or separately, with the same next-day dispatch as the rest of the catalog.",
      "Bacteriostatic water is a laboratory reagent supplied for research use only.",
    ],
  },
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const { category } = params;
  const categoryName = SLUG_TO_CATEGORY[category];
  if (!categoryName) return {};

  const title = `${categoryName} Research Peptides`;
  const description = CATEGORY_INTRO[categoryName] ?? CATEGORY_DESC[categoryName];
  const url = `${SITE_URL}/shop/${category}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description },
    twitter: { card: "summary", title, description },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const { category } = params;
  const categoryName = SLUG_TO_CATEGORY[category];
  if (!categoryName) notFound();

  const allProducts = await getAllCatalogProducts();
  const products = allProducts.filter((p) => !p.hidden && p.category === categoryName);
  const otherCategories = Object.entries(SLUG_TO_CATEGORY).filter(([slug]) => slug !== category);
  const seoBlock = CATEGORY_SEO_BLOCK[categoryName];

  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner /><Header />
      <main>
        {/* Hero */}
        <section className="relative pt-[112px] bg-background-900 border-b border-background-200/60">
          <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none"></div>
          <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-10 py-14 md:py-16">
            <div className="flex items-center justify-between gap-4 mb-6">
              <nav className="flex items-center gap-2 text-[12px] text-foreground-500 font-mono">
                <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/shop" className="hover:text-primary-500 transition-colors">Shop</Link>
                <span>/</span>
                <span className="text-primary-500">{categoryName}</span>
              </nav>
              <Link href="/shop" className="group hidden sm:inline-flex items-center gap-2 text-[12px] font-medium text-foreground-400 hover:text-primary-500 transition-colors cursor-pointer">
                <i className="ri-arrow-left-line text-[13px] group-hover:-translate-x-1 transition-transform"></i>Back to Shop
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-px bg-primary-500/60"></span>
              <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">Category</span>
            </div>
            <h1 className="font-display text-[40px] md:text-[54px] leading-[0.95] tracking-tightest text-foreground-100 mb-4">
              {categoryName}
            </h1>
            <p className="text-[14px] text-foreground-500 max-w-lg">{CATEGORY_DESC[categoryName]}</p>
            <div className="flex items-center gap-3 mt-6">
              <span className="font-mono text-[11px] text-foreground-600">{products.length} compound{products.length !== 1 ? "s" : ""} available</span>
              <span className="w-px h-3 bg-background-300"></span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-secondary-500">
                <i className="ri-shield-check-line text-[12px]"></i>All batches COA verified
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-background-200/40">
              <span className="font-mono text-[10px] tracking-[0.18em] text-foreground-600 uppercase mr-1">Other Categories</span>
              {otherCategories.map(([slug, name]) => (
                <Link
                  key={slug}
                  href={`/shop/${slug}`}
                  className="px-3 py-1.5 rounded-full border border-background-200/60 bg-background-100/60 text-[12px] text-foreground-400 hover:border-primary-500/50 hover:text-primary-500 transition-all cursor-pointer whitespace-nowrap"
                >
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Intro (2–3 sentences, keyword-led) + product grid */}
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-16">
          {CATEGORY_INTRO[categoryName] && (
            <p className="text-[15px] text-foreground-400 leading-relaxed max-w-3xl mb-10">
              {CATEGORY_INTRO[categoryName]}
            </p>
          )}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <i className="ri-flask-line text-[48px] text-foreground-600 mb-4"></i>
              <p className="text-foreground-400 text-[15px] mb-2">No products currently in this category.</p>
              <Link href="/shop" className="mt-4 h-9 px-5 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer">
                Browse all compounds
              </Link>
            </div>
          )}
        </section>

        {/* SEO content block */}
        {seoBlock && (
          <section className="border-t border-background-200/60 bg-background-900/40 py-16 md:py-20">
            <div className="w-full max-w-[900px] mx-auto px-6 md:px-10">
              <h2 className="font-display text-[22px] md:text-[26px] text-foreground-100 mb-5">
                {seoBlock.heading}
              </h2>
              <div className="space-y-4">
                {seoBlock.paragraphs.map((p, i) => (
                  <p key={i} className="text-[13.5px] text-foreground-500 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="border-t border-background-200/60 bg-background-900/50 py-14">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-[24px] text-foreground-100 mb-1">Need a different compound?</h2>
              <p className="text-[14px] text-foreground-500">Browse our full research catalog or contact us for custom bulk orders.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/shop" className="h-10 px-6 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer inline-flex items-center gap-2">
                <i className="ri-apps-line text-[14px]"></i>Full Catalog
              </Link>
              <Link href="/contact" className="h-10 px-6 rounded-md border border-background-200 text-[13px] text-foreground-300 hover:border-primary-500 hover:text-primary-500 transition-all cursor-pointer inline-flex items-center gap-2">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
