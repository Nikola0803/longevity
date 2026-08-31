import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";
import {
  LegalSection,
  Divider,
  IconGrid,
  CheckList,
  CrossList,
  StepList,
  ContactCard,
} from "@/components/legal/LegalUI";
import { SITE, LEGAL_ROUTES } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Shipping & Returns · VERTALIS",
  description:
    "Vertalis Peptides shipping, delivery, and return policy for research-use-only products.",
};

const related = [
  { label: "Privacy Policy", href: LEGAL_ROUTES.privacy },
  { label: "Terms of Service", href: LEGAL_ROUTES.terms },
  { label: "Research Use Only", href: LEGAL_ROUTES.researchUse },
];

export default function ShippingReturnsPage() {
  return (
    <LegalShell
      line1="Shipping &"
      line2="Returns"
      breadcrumb="Shipping & Returns"
      related={related}
    >
      {/* Quick summary tiles */}
      <IconGrid
        items={[
          {
            icon: "ri-truck-line",
            title: `Ships in ${SITE.handlingTime}`,
            desc: `Orders are processed and dispatched within ${SITE.handlingTime} to ${SITE.shipsTo}.`,
          },
          {
            icon: "ri-time-line",
            title: "30-Day Window",
            desc: "Returns accepted within 30 days of delivery for eligible items.",
          },
          {
            icon: "ri-shield-check-line",
            title: "Sealed Products Only",
            desc: "Products must be unopened, sealed, and in original condition.",
          },
        ]}
      />

      <LegalSection n={1} title="Shipping & Delivery">
        <p>
          Orders are typically processed within {SITE.handlingTime}. We currently ship to{" "}
          {SITE.shipsTo}. Shipping times are estimates and are not guaranteed. Risk of loss
          passes to you upon delivery to the carrier. We are not responsible for delays
          caused by carriers, weather, customs, or other circumstances beyond our control.
          You are responsible for providing an accurate, complete shipping address.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={2} title="Return Eligibility">
        <p>
          Due to the nature of our research-grade products, we have strict return
          guidelines. To be eligible for a return, items must meet ALL of the following
          criteria:
        </p>
        <CheckList
          items={[
            "Item must be returned within 30 days of the delivery date",
            "Product must be in its original, unopened, and sealed condition",
            "Original packaging must be intact and undamaged",
            "A Return Merchandise Authorisation (RMA) number must be obtained before shipping",
            "Proof of purchase (order number or receipt) must be included",
          ]}
        />
      </LegalSection>

      <Divider />

      <LegalSection n={3} title="Non-Returnable Items">
        <p>
          The following items are NOT eligible for return under any circumstances:
        </p>
        <CrossList
          items={[
            "Opened or used products of any kind",
            "Products that have been stored improperly or exposed to extreme temperatures",
            "Items returned more than 30 days after delivery",
            "Items returned without prior authorisation",
            "Custom or special-order products",
            "Digital products (documentation, reports, etc.)",
          ]}
        />
      </LegalSection>

      <Divider />

      <LegalSection n={4} title="How to Initiate a Return">
        <StepList
          steps={[
            {
              step: "01",
              title: "Contact Us",
              desc: "Reach out to our support team via our contact page with your order number and reason for return.",
            },
            {
              step: "02",
              title: "Receive Your RMA",
              desc: "If your return is approved, we will issue a Return Merchandise Authorisation (RMA) number within 2 business days.",
            },
            {
              step: "03",
              title: "Ship the Item",
              desc: "Pack the item securely in its original packaging, include the RMA number, and ship to the address provided. You are responsible for return shipping costs.",
            },
            {
              step: "04",
              title: "Processing",
              desc: "Once we receive and inspect the returned item, we will process your refund or exchange within 5–7 business days.",
            },
          ]}
        />
      </LegalSection>

      <Divider />

      <LegalSection n={5} title="Refunds">
        <p>
          Approved refunds will be issued to the original payment method within 5–7 business
          days of receiving and inspecting the returned item. Original shipping charges are
          non-refundable. We reserve the right to charge a restocking fee of up to 15% for
          items returned in less than perfect condition.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={6} title="Damaged or Incorrect Items">
        <p>
          If you receive a damaged or incorrect item, please contact us within 48 hours of
          delivery with photos of the damage and your order number. We will arrange for a
          replacement or refund at no cost to you. Do not return damaged items without
          contacting us first.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={7} title="Contact">
        <p>Please have your order number ready when contacting us about a return.</p>
        <ContactCard dept="Returns" />
      </LegalSection>
    </LegalShell>
  );
}
