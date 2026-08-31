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
import "./globals.css";

const SITE_URL = "https://longevitypeptides.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LONGEVITY PEPTIDES · Research Peptides",
    template: "%s · LONGEVITY PEPTIDES",
  },
  description:
    "Longevity Peptides is a dedicated supplier of high-purity research peptides and biochemicals for laboratory use. Every product undergoes rigorous third-party analytical verification, with public, batch-searchable Certificates of Analysis.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "LONGEVITY PEPTIDES",
    title: "LONGEVITY PEPTIDES · Research Peptides",
    description:
      "High-purity research peptides, independently tested by third-party labs. Every batch ships with a public, searchable Certificate of Analysis.",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css" />
      </head>
      <body className="bg-background-800 text-foreground-100 font-sans antialiased min-h-screen">
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
      </body>
    </html>
  );
}
