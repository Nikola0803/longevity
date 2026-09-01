import { Outlet } from "react-router-dom";
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

// The storefront's single shared shell — every route renders inside this
// via <Outlet/>. Same providers/chrome the Next.js app's (site)/layout.tsx
// used to wrap every page with.
export default function App() {
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
            <Outlet />
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
