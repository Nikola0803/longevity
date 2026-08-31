import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";
import {
  LegalSection,
  Divider,
  CriticalBox,
  CrossList,
  ContactCard,
} from "@/components/legal/LegalUI";
import { SITE, LEGAL_ROUTES } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Terms of Service · VERTALIS",
  description:
    "The terms and conditions governing use of the Vertalis Peptides website and the purchase of research-use-only products.",
};

const related = [
  { label: "Privacy Policy", href: LEGAL_ROUTES.privacy },
  { label: "Shipping & Returns", href: LEGAL_ROUTES.shippingReturns },
  { label: "Research Use Only", href: LEGAL_ROUTES.researchUse },
];

export default function TermsPage() {
  return (
    <LegalShell
      line1="Terms of"
      line2="Service"
      breadcrumb="Terms of Service"
      related={related}
    >
      <CriticalBox label="Important">
        All products sold by {SITE.legalName} are intended exclusively for research and
        laboratory use. These products are NOT intended for human consumption, injection,
        therapeutic use, or veterinary use. By placing an order, you confirm that you are a
        qualified researcher or scientist using these products solely for legitimate
        research purposes.
      </CriticalBox>

      <LegalSection n={1} title="Acceptance of Terms">
        <p>
          By accessing or using the {SITE.brand} website (the “Site”), purchasing our
          products, or interacting with us in any way, you agree to be bound by these Terms
          of Service (“Terms”). If you do not agree to these Terms, please do not use our
          Site or purchase our products. We reserve the right to update these Terms at any
          time without prior notice.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={2} title="Eligibility">
        <p>
          You must be at least {SITE.minimumAge} years of age to use this Site and purchase
          our products. By using this Site, you represent and warrant that you are at least{" "}
          {SITE.minimumAge} years old and have the legal capacity to enter into a binding
          agreement. You also represent that you are a qualified researcher, scientist, or
          authorised purchaser of research chemicals.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={3} title="Product Use Restrictions">
        <p>
          All products sold on this Site are strictly for research purposes only. You agree
          that you will NOT:
        </p>
        <CrossList
          items={[
            "Use any product for human consumption, self-administration, or injection",
            "Administer any product to animals or pets outside of an authorised laboratory setting",
            "Resell products without obtaining proper authorisations",
            "Use products for any illegal purpose",
            "Misrepresent the intended use of any product at the time of purchase",
            "Use products outside of the country in which they were ordered where prohibited by law",
          ]}
        />
      </LegalSection>

      <Divider />

      <LegalSection n={4} title="Orders & Payment">
        <p>
          All orders are subject to acceptance and availability. We reserve the right to
          refuse or cancel any order at our discretion. Prices are listed in USD and are
          subject to change without notice. Payment is due at the time of purchase. We
          accept the payment methods listed at checkout. You are responsible for all
          applicable taxes.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={5} title="Shipping & Delivery">
        <p>
          Orders are typically processed within {SITE.handlingTime}. We currently ship to{" "}
          {SITE.shipsTo}. Shipping times are estimates and not guaranteed. Risk of loss
          passes to you upon delivery to the carrier. We are not responsible for delays
          caused by carriers, weather, or other circumstances beyond our control. See our{" "}
          <a href={LEGAL_ROUTES.shippingReturns} className="text-primary-500 hover:underline">
            Shipping &amp; Returns policy
          </a>{" "}
          for full details.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={6} title="Intellectual Property">
        <p>
          All content on this Site, including but not limited to text, graphics, logos,
          images, and software, is the property of {SITE.legalName} and is protected by
          applicable intellectual property laws. You may not reproduce, distribute, or
          create derivative works from any content without our express written permission.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={7} title="Disclaimer of Warranties">
        <p>
          Products are sold “AS IS” for research purposes only. {SITE.legalName} makes no
          warranties, express or implied, including without limitation any implied
          warranties of merchantability or fitness for a particular purpose. We do not
          warrant that our products will produce any specific research outcomes.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={8} title="Limitation of Liability">
        <p>
          To the fullest extent permitted by law, {SITE.legalName} shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages arising
          from your use of our products or Site. Our total liability shall not exceed the
          amount paid by you for the specific product giving rise to the claim.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={9} title="Governing Law">
        <p>
          These Terms shall be governed by and construed in accordance with{" "}
          {SITE.governingLaw}. Any disputes arising under these Terms shall be resolved in
          the courts of the applicable jurisdiction.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={10} title="Contact">
        <ContactCard dept="Legal" />
      </LegalSection>
    </LegalShell>
  );
}
