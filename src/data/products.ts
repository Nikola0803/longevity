import type { Product } from "@/lib/product-types";

/**
 * Hardcoded fallback catalog — serves the shop when WooCommerce is
 * unreachable or unconfigured (see src/lib/woo.ts), so the site never shows
 * an empty shop. Product names/categories carried over from longevity-peps;
 * PRICES ARE PLACEHOLDERS, replace with real values from your WooCommerce
 * store before launch.
 */

const IN_STOCK = "text-secondary-500 shadow-[0_0_5px_1px_currentColor]";

function peptide(opts: {
  name: string;
  slug: string;
  spec: string;
  price: number;
  category?: string;
  description: string;
}): Product {
  return {
    slug: opts.slug,
    name: opts.name,
    spec: opts.spec,
    price: opts.price,
    image: "/images/placeholder.png",
    imgAlt: `${opts.name} ${opts.spec} research vial`,
    imgTitle: `${opts.name} · ${opts.spec}`,
    category: opts.category ?? "Peptides",
    purity: "≥99% (HPLC)",
    description: opts.description,
    statusDot: IN_STOCK,
    statusLabel: "In Stock",
    disabled: false,
    buttonText: "Add to Cart",
  };
}

export const FALLBACK_PRODUCTS: Product[] = [
  peptide({ name: "BPC-157", slug: "bpc-157-5mg", spec: "5mg", price: 45, description: "Body Protection Compound, studied for tissue repair research." }),
  peptide({ name: "BPC-157", slug: "bpc-157-10mg", spec: "10mg", price: 79, description: "Body Protection Compound, studied for tissue repair research." }),
  peptide({ name: "TB-500", slug: "tb-500-5mg", spec: "5mg", price: 49, description: "Thymosin Beta-4 fragment, studied for cell migration and repair research." }),
  peptide({ name: "TB-500", slug: "tb-500-10mg", spec: "10mg", price: 85, description: "Thymosin Beta-4 fragment, studied for cell migration and repair research." }),
  peptide({ name: "Wolverine Stack", slug: "wolverine-stack-5mg", spec: "5mg + 5mg", price: 89, category: "Peptide Blends", description: "BPC-157 + TB-500 blend for combined tissue-repair research protocols." }),
  peptide({ name: "CJC-1295 (DAC)", slug: "cjc-1295-dac-2mg", spec: "2mg", price: 55, description: "Growth-hormone-releasing hormone analog studied for its extended half-life." }),
  peptide({ name: "Ipamorelin", slug: "ipamorelin-5mg", spec: "5mg", price: 39, description: "Selective growth hormone secretagogue studied in GH-axis research." }),
  peptide({ name: "Tesamorelin", slug: "tesamorelin-5mg", spec: "5mg", price: 65, description: "Growth-hormone-releasing factor analog studied in metabolic research." }),
  peptide({ name: "Semaglutide", slug: "semaglutide-5mg", spec: "5mg", price: 95, category: "Fat Loss & Metabolic", description: "GLP-1 receptor agonist studied in metabolic and appetite-regulation research." }),
  peptide({ name: "Tirzepatide", slug: "tirzepatide-30mg", spec: "30mg", price: 129, category: "Fat Loss & Metabolic", description: "Dual GIP/GLP-1 receptor agonist studied in metabolic research." }),
  peptide({ name: "Retatrutide", slug: "retatrutide-10mg", spec: "10mg", price: 149, category: "Fat Loss & Metabolic", description: "Triple GIP/GLP-1/glucagon receptor agonist studied in metabolic research." }),
  peptide({ name: "NAD+", slug: "nad-500mg", spec: "500mg", price: 69, category: "Longevity", description: "Nicotinamide adenine dinucleotide, studied for cellular energy metabolism." }),
  peptide({ name: "GHK-Cu", slug: "ghk-cu-50mg", spec: "50mg", price: 59, category: "Longevity", description: "Copper peptide studied for tissue remodeling and skin research." }),
  peptide({ name: "Gonadorelin", slug: "gonadorelin-5mg", spec: "5mg", price: 49, description: "Gonadotropin-releasing hormone analog studied in HPG axis research." }),
  peptide({ name: "Selank", slug: "selank-5mg", spec: "5mg", price: 45, category: "Cognitive", description: "Synthetic tuftsin analog studied for anxiolytic and cognitive research." }),
  peptide({ name: "Semax", slug: "semax-30mg", spec: "30mg", price: 55, category: "Cognitive", description: "ACTH(4-10) analog studied for cognitive and neuroprotective research." }),
  peptide({ name: "Bacteriostatic Water", slug: "bac-water-30ml", spec: "30mL", price: 15, category: "Research Supplies", description: "Bacteriostatic water for reconstituting lyophilized research peptides." }),
];
