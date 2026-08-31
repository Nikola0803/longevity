import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";
import {
  LegalSection,
  Divider,
  CheckList,
  ArrowList,
  IconGrid,
  ContactCard,
} from "@/components/legal/LegalUI";
import { SITE, LEGAL_ROUTES } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy · VERTALIS",
  description:
    "How Vertalis Peptides collects, uses, and protects your personal information.",
};

const related = [
  { label: "Terms of Service", href: LEGAL_ROUTES.terms },
  { label: "Shipping & Returns", href: LEGAL_ROUTES.shippingReturns },
  { label: "Research Use Only", href: LEGAL_ROUTES.researchUse },
];

export default function PrivacyPage() {
  return (
    <LegalShell
      line1="Privacy"
      line2="Policy"
      breadcrumb="Privacy Policy"
      related={related}
    >
      <LegalSection n={1} title="Introduction">
        <p>
          {SITE.legalName} (“we,” “us,” or “our”) is committed to protecting your personal
          information and your right to privacy. This Privacy Policy describes how we
          collect, use, and share information about you when you use our website, make
          purchases, or interact with us in any way. By using our Site, you agree to the
          terms of this policy.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={2} title="Information We Collect">
        <p>We may collect the following types of information:</p>
        <CheckList
          items={[
            "Personal identification information: name, email address, phone number, billing and shipping address",
            "Payment information: processed securely through third-party payment providers; we do not store full card numbers",
            "Usage data: IP address, browser type, pages visited, time and date of visit, referring URLs",
            "Communications: any messages or inquiries you send us via email or contact forms",
          ]}
        />
      </LegalSection>

      <Divider />

      <LegalSection n={3} title="How We Use Your Information">
        <p>We use your information to:</p>
        <ArrowList
          items={[
            "Process and fulfil your orders",
            "Send order confirmations, shipping updates, and receipts",
            "Respond to your inquiries and provide customer support",
            "Improve our website and product offerings",
            "Send promotional emails (only if you have opted in)",
            "Comply with legal obligations",
            "Prevent fraud and ensure the security of our platform",
          ]}
        />
      </LegalSection>

      <Divider />

      <LegalSection n={4} title="Sharing Your Information">
        <p>
          We do not sell, trade, or rent your personal information to third parties. We may
          share information with trusted service providers who assist us in operating our
          website and conducting our business (e.g., payment processors, shipping carriers,
          email platforms), provided they agree to keep this information confidential. We
          may also disclose information when required by law or to protect our rights.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={5} title="Cookies & Tracking Technologies">
        <p>
          Our website uses cookies and similar tracking technologies to enhance your
          experience. Cookies are small data files stored on your device. You can instruct
          your browser to refuse all cookies or indicate when a cookie is being sent.
          However, some features of the Site may not function properly without cookies.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={6} title="Data Security">
        <p>
          We implement industry-standard security measures to protect your personal
          information. However, no method of transmission over the Internet or electronic
          storage is 100% secure. We strive to use commercially acceptable means to protect
          your data but cannot guarantee its absolute security.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={7} title="Your Rights">
        <p>
          Depending on your location, you may have the following rights regarding your
          personal data:
        </p>
        <IconGrid
          items={[
            { icon: "ri-eye-line", title: "Access", desc: "Request a copy of the personal data we hold about you." },
            { icon: "ri-edit-line", title: "Correction", desc: "Request correction of inaccurate or incomplete data." },
            { icon: "ri-delete-bin-line", title: "Deletion", desc: "Request deletion of your personal data." },
            { icon: "ri-mail-close-line", title: "Opt-Out", desc: "Unsubscribe from marketing communications at any time." },
          ]}
        />
      </LegalSection>

      <Divider />

      <LegalSection n={8} title="Third-Party Links">
        <p>
          Our website may contain links to third-party websites. We are not responsible for
          the privacy practices or content of those sites. We encourage you to review the
          privacy policies of any third-party sites you visit.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={9} title="Children's Privacy">
        <p>
          Our website is not directed at children. We do not knowingly collect personal
          information from anyone under the age of {SITE.minimumAge}. If you believe we have
          inadvertently collected such information, please contact us immediately.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={10} title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Any changes will be posted on
          this page with a revised “Last updated” date. We encourage you to review this
          policy periodically.
        </p>
      </LegalSection>

      <Divider />

      <LegalSection n={11} title="Contact Us">
        <p>
          If you have any questions about this Privacy Policy or how we handle your data,
          please contact us:
        </p>
        <ContactCard dept="Privacy" />
      </LegalSection>
    </LegalShell>
  );
}
