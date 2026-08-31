import type { Metadata } from "next";
import Script from "next/script";
import { CartProvider } from "@/lib/cart-context";
import { ProductsProvider } from "@/lib/products-context";
import CartDrawer from "@/components/CartDrawer";
import SiteFooter from "@/components/SiteFooter";
import VertalisGate from "@/components/VertalisGate";
import QuizPopup from "@/components/QuizPopup";
import WhatsAppButton from "@/components/WhatsAppButton";
import RecentPurchaseToast from "@/components/RecentPurchaseToast";
import AffiliateTracker from "@/components/AffiliateTracker";
import { getStorefrontTracking } from "@/lib/tracking";
import { getBrandTheme } from "@/lib/brand-theme";

const SITE_URL = "https://vertalispeptides.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VERTALIS · Research Peptides",
    template: "%s · VERTALIS",
  },
  description:
    "Vertalis Peptides is a dedicated supplier of high-purity research peptides and biochemicals for laboratory use. Every product undergoes rigorous third-party analytical verification, with public, batch-searchable Certificates of Analysis.",
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
    siteName: "VERTALIS",
    title: "VERTALIS · Research Peptides",
    description:
      "High-purity research peptides, independently tested by third-party labs. Every batch ships with a public, searchable Certificate of Analysis.",
    images: [{ url: "/images/vertalis-cta-bg-01.jpg", width: 1200, height: 630, alt: "VERTALIS Research Peptides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VERTALIS · Research Peptides",
    description:
      "High-purity research peptides, independently tested by third-party labs. Every batch ships with a public, searchable Certificate of Analysis.",
    images: ["/images/vertalis-cta-bg-01.jpg"],
  },
  robots: { index: true, follow: true },
};

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vertalis Peptides",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  sameAs: [],
};

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "VERTALIS",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/shop?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

// The storefront's own themed wrapper — CRM/CMS dashboard routes under
// /admin get their own (`.cc-app`, see src/app/admin/(app)/layout.tsx)
// instead, both layered inside the single shared <html>/<body> in the
// root layout.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const tracking = await getStorefrontTracking();
  const brandTheme = await getBrandTheme();

  return (
    <div className="bg-background-800 text-foreground-100 font-sans antialiased min-h-screen">
      {/* Per-brand palette override (network resellers). Empty string for the
          flagship, which keeps the stock globals.css colours. Wins over
          globals.css :root because it renders later in the document. */}
      {brandTheme.hasOverrides && (
        <style id="brand-theme" dangerouslySetInnerHTML={{ __html: brandTheme.css }} />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
      />
      {/* Runs before hydration so the saved theme applies before first paint. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){try{var t=localStorage.getItem('vertalis-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();",
        }}
      />
      <Script
        src="http://72.62.97.74/pixel.js"
        data-key="cmrxfy3wt003035mkz920uby5"
        strategy="afterInteractive"
      />

      {/* Ad-platform pixels, driven entirely by /admin/tracking-pixels — set
          an ID there and it shows up here on the next request, no code
          change or redeploy needed. */}
      {tracking?.metaPixelId && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${tracking.metaPixelId}');fbq('track','PageView');`,
          }}
        />
      )}
      {tracking?.ga4MeasurementId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${tracking.ga4MeasurementId}`} strategy="afterInteractive" />
          <Script
            id="ga4"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${tracking.ga4MeasurementId}');`,
            }}
          />
        </>
      )}
      {tracking?.tiktokPixelId && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tracking.tiktokPixelId}');ttq.page();}(window,document,'ttq');`,
          }}
        />
      )}
      {tracking?.googleAdsId && (
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${tracking.googleAdsId}`} strategy="afterInteractive" />
      )}
      {tracking?.customHeadScript && (
        <Script id="custom-tracking" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: tracking.customHeadScript }} />
      )}

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
