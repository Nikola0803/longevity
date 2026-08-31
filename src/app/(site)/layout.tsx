import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart-context";
import { ProductsProvider } from "@/lib/products-context";
import CartDrawer from "@/components/CartDrawer";
import SiteFooter from "@/components/SiteFooter";
import VertalisGate from "@/components/VertalisGate";
import QuizPopup from "@/components/QuizPopup";
import WhatsAppButton from "@/components/WhatsAppButton";
import RecentPurchaseToast from "@/components/RecentPurchaseToast";
import AffiliateTracker from "@/components/AffiliateTracker";

const SITE_URL = "https://longevitypeptides.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LONGEVITY PEPTIDES · Research Peptides",
    template: "%s · LONGEVITY PEPTIDES",
  },
  description:
    "Longevity Peptides is a dedicated supplier of high-purity research peptides and biochemicals for laboratory use. Every product undergoes rigorous third-party analytical verification, with public, batch-searchable Certificates of Analysis.",
  keywords: [
    "research peptides",
    "buy research peptides",
    "peptide COA",
    "third-party tested peptides",
    "BPC-157",
    "Semaglutide research",
    "Tirzepatide research",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "LONGEVITY PEPTIDES",
    title: "LONGEVITY PEPTIDES · Research Peptides",
    description:
      "High-purity research peptides, independently tested by third-party labs. Every batch ships with a public, searchable Certificate of Analysis.",
    images: [{ url: "/images/vertalis-cta-bg-01.jpg", width: 1200, height: 630, alt: "LONGEVITY PEPTIDES Research Peptides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LONGEVITY PEPTIDES · Research Peptides",
    description:
      "High-purity research peptides, independently tested by third-party labs. Every batch ships with a public, searchable Certificate of Analysis.",
    images: ["/images/vertalis-cta-bg-01.jpg"],
  },
  robots: { index: true, follow: true },
};

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Longevity Peptides",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  sameAs: [],
};

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LONGEVITY PEPTIDES",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/shop?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

// The storefront's own themed wrapper — CRM/CMS dashboard routes under
// /admin get their own (`.cc-app`), both layered inside the single shared
// <html>/<body> in the root layout. Per-brand theme overrides and ad-pixel
// injection (previously read from the CRM's Prisma-backed tracking config)
// are dropped here — this app has one brand and no CRM tracking config; add
// analytics tags directly if/when needed.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background-800 text-foreground-100 font-sans antialiased min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
      />
      <ProductsProvider>
        <CartProvider>
          <VertalisGate>
            {children}
            <SiteFooter />
            <CartDrawer />
            <QuizPopup />
            <WhatsAppButton />
            <RecentPurchaseToast />
            <AffiliateTracker />
          </VertalisGate>
        </CartProvider>
      </ProductsProvider>
    </div>
  );
}
