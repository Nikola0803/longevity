import type { Product } from "@/lib/product-types";

/**
 * Storefront catalog fallback — served by src/lib/storefront-catalog.ts
 * when WooCommerce is unreachable or unconfigured (see .env.example), so
 * the shop is never empty. Product names, categories, and research
 * descriptions are pulled directly from longevity-peps' own research
 * content (src/lib/peptideResearch.ts in that repo) — no Vertalis/dummy
 * catalog data. Images are hosted on the live longevitytech-lab.store
 * asset CDN (same one the site's own logo/photos are served from).
 *
 * PRICES ARE PLACEHOLDERS — replace with real values once WooCommerce is
 * connected (WOO_STORE_URL/WOO_CONSUMER_KEY/WOO_CONSUMER_SECRET), at which
 * point this fallback stops being used entirely.
 */

const IN_STOCK = "text-secondary-500 shadow-[0_0_5px_1px_currentColor]";

function peptide(opts: {
  name: string;
  slug: string;
  spec: string;
  price: number;
  category: string;
  image: string;
  description: string;
}): Product {
  return {
    slug: opts.slug,
    name: opts.name,
    spec: opts.spec,
    price: opts.price,
    image: opts.image,
    imgAlt: `${opts.name} ${opts.spec} research vial`,
    imgTitle: `${opts.name} · ${opts.spec}`,
    category: opts.category,
    purity: "≥99% (HPLC)",
    description: opts.description,
    statusDot: IN_STOCK,
    statusLabel: "In Stock",
    disabled: false,
    buttonText: "Add to Cart",
  };
}

export const PRODUCTS: Product[] = [
  peptide({
    name: "Tirzepatide",
    slug: "tirzepatide",
    spec: "30mg",
    price: 129,
    category: "Fat Loss & Metabolic",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/845c9fbb-16ed-49ba-8be4-768348d11f68/Tirzepatide.png",
    description: "A dual GIP and GLP-1 receptor agonist studied for its effects on appetite regulation and metabolic health. Clinical trials have reported substantial reductions in body weight versus single-agonist comparators, alongside improvements in glycemic markers and insulin sensitivity in adults with type 2 diabetes.",
  }),
  peptide({
    name: "Retatrutide",
    slug: "retatrutide",
    spec: "10mg",
    price: 149,
    category: "Fat Loss & Metabolic",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/1aff2c84-79c5-449b-8407-a4310a4ff1ad/Retatrutide.png",
    description: "A triple agonist targeting GIP, GLP-1, and glucagon receptors. Phase 2 research has investigated dose-dependent weight reduction over 48 weeks, with secondary measures including hepatic fat content, lipid panels, and cardiometabolic markers in adults with obesity.",
  }),
  peptide({
    name: "Semaglutide",
    slug: "semaglutide",
    spec: "5mg",
    price: 95,
    category: "Fat Loss & Metabolic",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/2c840ad8-ed85-484e-a8ef-bdbe52bc9649/Semaglutide.png",
    description: "A GLP-1 receptor agonist with a well-characterized clinical profile. Large randomized trials have documented its role in glycemic control and chronic weight management, including effects on satiety signaling, gastric emptying, and cardiovascular endpoints.",
  }),
  peptide({
    name: "AOD-9604",
    slug: "aod-9604",
    spec: "5mg",
    price: 55,
    category: "Fat Loss & Metabolic",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/a25642f1-9fc2-4c1f-8b1e-a4484ccafbe8/AOD-9604.png",
    description: "A modified fragment of human growth hormone (residues 176–191) investigated for its lipolytic activity without the broader metabolic effects of full-length hGH. Preclinical work has focused on stimulation of adipose tissue breakdown and inhibition of lipogenesis.",
  }),
  peptide({
    name: "BPC-157",
    slug: "bpc-157",
    spec: "5mg",
    price: 45,
    category: "Recovery & Repair",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/7ffa3ea8-fe8f-4368-a6b6-82172bdc875e/BPC-157.png",
    description: "A pentadecapeptide derived from a protective protein in gastric juice. Animal studies have explored angiogenic effects, tendon and ligament healing, gastrointestinal repair, and modulation of the nitric oxide and growth hormone receptor pathways.",
  }),
  peptide({
    name: "TB-500",
    slug: "tb-500",
    spec: "5mg",
    price: 49,
    category: "Recovery & Repair",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/9780cbbf-e7ea-4cb2-bbe7-247eb0e34b16/TB-500.png",
    description: "A synthetic fragment of thymosin beta-4 studied for cell migration, actin regulation, and tissue repair. Research has reported effects on muscle and tendon recovery, wound healing kinetics, and reduction of inflammation in animal injury models.",
  }),
  peptide({
    name: "Wolverine Stack",
    slug: "wolverine-stack",
    spec: "5mg + 5mg",
    price: 89,
    category: "Recovery & Repair",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/97239e5d-d868-4fa9-9f44-88c39a872c65/Wolverine.png",
    description: "A combined protocol pairing BPC-157 and TB-500. The two peptides target complementary pathways — BPC-157 through angiogenesis and growth factor signaling, TB-500 through actin sequestration and cell migration — and are commonly studied together in tendon, ligament, and soft-tissue recovery models.",
  }),
  peptide({
    name: "GHK-CU",
    slug: "ghk-cu",
    spec: "50mg",
    price: 59,
    category: "Longevity",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/c3fe0638-9822-4d31-bec0-bb6191843cdc/GHK-CU.png",
    description: "A copper-binding tripeptide naturally present in human plasma at declining levels with age. Research has examined its role in collagen and elastin synthesis, antioxidant defense, gene expression modulation, and dermal remodeling in skin and hair follicle models.",
  }),
  peptide({
    name: "AHK-CU",
    slug: "ahk-cu",
    spec: "50mg",
    price: 55,
    category: "Longevity",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/0c1075d3-95d0-4cf1-9f3b-f69e5fd813c4/AHK-CU.png",
    description: "A copper-binding tripeptide investigated primarily for hair follicle biology. Studies have looked at dermal papilla cell proliferation, VEGF expression, and follicular angiogenesis as potential mechanisms relevant to hair growth and scalp health.",
  }),
  peptide({
    name: "Epithalon",
    slug: "epithalon",
    spec: "10mg",
    price: 65,
    category: "Longevity",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/48f3d2a6-d54f-4671-ab1c-92bdff267769/Epithalon.png",
    description: "A synthetic tetrapeptide modeled on epithalamin, a pineal-derived compound. Research has explored telomerase activity, circadian regulation, and age-related markers in animal and limited human studies, with proposed mechanisms involving regulation of the pineal–hypothalamic axis.",
  }),
  peptide({
    name: "SS-31",
    slug: "ss-31",
    spec: "50mg",
    price: 75,
    category: "Longevity",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/a487523a-8190-4bff-bb47-2ff595c04b0b/SS-31.png",
    description: "A mitochondria-targeted tetrapeptide (also referenced as elamipretide) that binds cardiolipin on the inner mitochondrial membrane. Research has investigated effects on electron transport efficiency, reactive oxygen species, and tissue function in cardiac, renal, and skeletal muscle aging models.",
  }),
  peptide({
    name: "MOTS-C",
    slug: "mots-c",
    spec: "10mg",
    price: 69,
    category: "Longevity",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/54596675-b365-43c8-93f4-c0b956a04584/MOTS-C.png",
    description: "A mitochondrial-derived peptide encoded within the 12S rRNA. Studies have focused on its role in metabolic homeostasis, AMPK activation, insulin sensitivity, and exercise capacity, with declining endogenous levels reported in aging tissue.",
  }),
  peptide({
    name: "NAD+",
    slug: "nad",
    spec: "500mg",
    price: 69,
    category: "Longevity",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/f7acf0c9-fc96-4cd9-a885-5cf377bfb918/NAD.png",
    description: "A coenzyme central to redox reactions, sirtuin signaling, and DNA repair pathways. Research has documented age-related declines in tissue NAD+ and explored restoration strategies in the context of mitochondrial function, cellular energetics, and longevity-associated gene expression.",
  }),
  peptide({
    name: "Ipamorelin",
    slug: "ipamorelin",
    spec: "5mg",
    price: 39,
    category: "Peptides",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/daa3358a-7d12-4408-9cfd-91e42173a8cf/Ipamorelin.png",
    description: "A selective growth hormone secretagogue acting on the ghrelin receptor. Studies have characterized its pulsatile stimulation of endogenous growth hormone release with minimal effects on cortisol or prolactin, a profile that has made it a reference compound in GH-axis research.",
  }),
  peptide({
    name: "CJC-1295 DAC",
    slug: "cjc-1295-dac",
    spec: "2mg",
    price: 55,
    category: "Peptides",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/6c936752-622c-4131-bfcc-9fa212e3bb98/CJC-1295_DAC.png",
    description: "A long-acting growth hormone-releasing hormone (GHRH) analogue stabilized by drug affinity complex (DAC) technology, extending half-life through albumin binding. Research has examined sustained elevation of growth hormone and IGF-1 levels following infrequent dosing.",
  }),
  peptide({
    name: "Tesamorelin",
    slug: "tesamorelin",
    spec: "5mg",
    price: 65,
    category: "Peptides",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/61e31de6-2cb7-4ec8-91cf-fc1a48205e57/Tesamorelin.png",
    description: "A stabilized GHRH analogue investigated for visceral adipose tissue reduction and effects on the GH/IGF-1 axis. Clinical research has documented changes in trunk fat, lipid profiles, and metabolic markers in HIV-associated lipodystrophy populations.",
  }),
  peptide({
    name: "IGF-1 LR3",
    slug: "igf-1-lr3",
    spec: "1mg",
    price: 59,
    category: "Peptides",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/d169bb4a-d9bf-4f82-ad40-8d5206b4ca93/IGF-1_LR3.png",
    description: "A long-arginine variant of insulin-like growth factor 1 with reduced affinity for IGF binding proteins, extending its biological half-life. Research has examined anabolic signaling through the IGF-1 receptor, satellite cell activation, and effects on protein synthesis in muscle tissue.",
  }),
  peptide({
    name: "Selank",
    slug: "selank",
    spec: "5mg",
    price: 45,
    category: "Cognitive",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/b54243c9-4dbb-4bae-91a8-8c0694ddd284/Selank.png",
    description: "A synthetic analogue of tuftsin developed in Russian neuropeptide research. Studies have investigated anxiolytic effects without sedation, modulation of GABAergic and serotonergic systems, and influence on BDNF expression in animal models.",
  }),
  peptide({
    name: "Semax",
    slug: "semax",
    spec: "30mg",
    price: 55,
    category: "Cognitive",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/a7b689a1-37f2-432b-a6f2-3b2d90eaa6cc/Semax.jpeg",
    description: "A short ACTH(4-10) analogue investigated for neuroprotective and cognitive effects. Research has explored BDNF and NGF upregulation, monoaminergic modulation, and effects on attention, memory, and recovery from ischemic events in animal and limited clinical studies.",
  }),
  peptide({
    name: "KPV",
    slug: "kpv",
    spec: "10mg",
    price: 39,
    category: "Recovery & Repair",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/11d6e7d5-786e-48a0-8c2e-5b8be187c090/KPV.png",
    description: "A tripeptide fragment of alpha-MSH studied for its anti-inflammatory activity. Research has focused on NF-κB pathway modulation, cytokine signaling, and effects in mucosal inflammation models including the gastrointestinal tract and skin.",
  }),
  peptide({
    name: "DSIP",
    slug: "dsip",
    spec: "5mg",
    price: 45,
    category: "Longevity",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/fd16cf45-6867-4776-bdc2-142e96e1692c/DSIP.png",
    description: "Delta Sleep-Inducing Peptide (DSIP) is a nonapeptide first isolated from the cerebral venous blood of sleeping rabbits. Research has examined its role in promoting delta-wave (slow-wave) sleep architecture, modulating stress responses, and influencing endocrine rhythms across the HPA axis.",
  }),
  peptide({
    name: "FOXO4-DRI",
    slug: "foxo4-dri",
    spec: "10mg",
    price: 79,
    category: "Longevity",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/0df0b897-3eee-40de-bcde-12cb8327d5e1/FOXO4-DRI.png",
    description: "A D-retro-inverso peptide designed to disrupt the FOXO4–p53 interaction inside senescent cells. Research has investigated selective clearance of senescent cells (senolysis) and downstream effects on tissue function, hair regrowth, and renal markers in aged murine models.",
  }),
  peptide({
    name: "Bacteriostatic Water",
    slug: "bac-water-30ml",
    spec: "30mL",
    price: 15,
    category: "Research Supplies",
    image: "https://longevitytech-lab.store/__l5e/assets-v1/ba5960b9-0cca-42a5-bae0-df61bdfea0b2/bac_water.png",
    description: "Bacteriostatic water for reconstituting lyophilized research peptides.",
  }),];
