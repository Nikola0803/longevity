import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";
import {
  LegalSection,
  Divider,
  CriticalBox,
  CheckList,
  ArrowList,
  IconGrid,
  ContactCard,
} from "@/components/legal/LegalUI";
import { SITE, LEGAL_ROUTES } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Research Use Only Policy · LONGEVITY PEPTIDES",
  description:
    "All Longevity Peptides products are supplied exclusively for in vitro research and laboratory use by qualified professionals. Not for human consumption.",
};

const related = [
  { label: "Privacy Policy", href: LEGAL_ROUTES.privacy },
  { label: "Terms of Service", href: LEGAL_ROUTES.terms },
  { label: "Shipping & Returns", href: LEGAL_ROUTES.shippingReturns },
];

export default function ResearchUsePage() {
  return (
    <LegalShell
      line1="Research Use"
      line2="Only Policy"
      breadcrumb="Research Use Only"
      related={related}
    >
      <CriticalBox>
        All products sold by {SITE.legalName} are supplied EXCLUSIVELY for in vitro
        research and laboratory use by qualified scientific professionals. These products
        are NOT approved for human consumption, injection, therapeutic treatment, or
        veterinary use. Misuse of research chemicals may be unlawful and is potentially
        dangerous.
      </CriticalBox>

      <LegalSection n={1} title="Scope of This Policy">
        <p>
          This Research Use Only (RUO) Policy applies to all products listed on the{" "}
          {SITE.brand} website. It defines the acceptable and prohibited uses of our
          products and establishes the responsibilities of purchasers. By purchasing from
          us, you explicitly agree to comply with this policy.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={2} title="What “Research Use Only” Means">
        <p>
          “Research Use Only” (RUO) means our products are intended solely for use in
          scientific investigations, studies, and experiments performed in controlled
          laboratory environments by qualified and trained researchers. RUO products:
        </p>
        <IconGrid
          items={[
            {
              icon: "ri-flask-line",
              title: "Are for in vitro use",
              desc: "Testing and experiments conducted outside a living organism in controlled laboratory conditions.",
            },
            {
              icon: "ri-user-line",
              title: "Are NOT for human use",
              desc: "Not intended for ingestion, injection, inhalation, or any form of human administration.",
            },
            {
              icon: "ri-hospital-line",
              title: "Are NOT therapeutic",
              desc: "Not approved as drugs, treatments, or medical interventions by the Therapeutic Goods Administration (TGA) or any regulatory body.",
            },
            {
              icon: "ri-microscope-line",
              title: "Require qualified personnel",
              desc: "Must be handled by trained scientists in appropriate laboratory settings.",
            },
          ]}
        />
      </LegalSection>

      <Divider />

      <LegalSection n={3} title="Purchaser Representations & Warranties">
        <p>
          By purchasing any product from {SITE.legalName}, you represent and warrant that:
        </p>
        <CheckList
          items={[
            "You are a qualified scientist, researcher, or authorised representative of a research institution",
            "You will use the products only for legitimate research or educational purposes in a controlled laboratory setting",
            "You have the proper facilities, equipment, and expertise to safely handle research-grade chemicals",
            "You will comply with all applicable Commonwealth, state, and territory laws regarding the purchase, storage, use, and disposal of research chemicals, including the Poisons Standard (SUSMP) and relevant Customs (Prohibited Imports) regulations",
            "You will NOT use the products for human consumption or administration in any form",
            "You will NOT resell or distribute products to any party who intends to use them for non-research purposes",
            `You are at least ${SITE.minimumAge} years of age`,
          ]}
        />
      </LegalSection>

      <Divider />

      <LegalSection n={4} title="Regulatory Compliance">
        <p>
          {SITE.legalName} is a chemical supplier, not a compounding pharmacy, and does not
          hold a licence to manufacture or supply therapeutic goods under the Therapeutic
          Goods Act 1989 (Cth). Our products have not been evaluated by the Therapeutic
          Goods Administration (TGA) and are not intended to diagnose, treat, cure, or
          prevent any disease or condition. Peptides supplied for research use are not
          included in the Australian Register of Therapeutic Goods (ARTG) and must not be
          imported, possessed, or supplied for human use without complying with the
          Poisons Standard (SUSMP) and any applicable state or territory poisons
          legislation. It is the purchaser&apos;s responsibility to determine and comply
          with any import permit requirements under the Customs (Prohibited Imports)
          Regulations 1956 before placing an order.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={5} title="Safe Handling Guidelines">
        <p>Research chemicals must be handled with appropriate precautions:</p>
        <ArrowList
          items={[
            "Always wear appropriate personal protective equipment (PPE) including lab coat, gloves, and eye protection",
            "Handle in well-ventilated areas or a fume hood as appropriate",
            "Store according to product specifications: many peptides require cold storage (-20°C or -80°C)",
            "Keep out of reach of children and unauthorised personnel",
            "Dispose of products in accordance with applicable environmental and safety regulations",
            "Review Safety Data Sheets (SDS) before handling any chemical",
          ]}
        />
      </LegalSection>

      <Divider />

      <LegalSection n={6} title="Indemnification">
        <p>
          You agree to indemnify, defend, and hold harmless {SITE.legalName}, its officers,
          employees, and agents from any claims, damages, losses, or expenses arising from
          your misuse of our products or your violation of this Research Use Only Policy or
          any applicable law.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={7} title="Contact Us">
        <p>
          If you have questions about proper research use, please contact us before
          purchasing.
        </p>
        <ContactCard dept="Compliance" />
      </LegalSection>
    </LegalShell>
  );
}
