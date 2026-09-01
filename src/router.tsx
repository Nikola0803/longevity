import { createBrowserRouter } from "react-router-dom";
import App from "@/App";

import HomePage from "@/app/(site)/page";
import AboutPage from "@/app/(site)/about/page";
import AccountPage from "@/app/(site)/account/page";
import AffiliatePage from "@/app/(site)/affiliate/page";
import BlogPage from "@/app/(site)/blog/page";
import CheckoutPage from "@/app/(site)/checkout/page";
import CoaPage from "@/app/(site)/coa/page";
import ContactPage from "@/app/(site)/contact/page";
import FaqPage from "@/app/(site)/faq/page";
import PrivacyPage from "@/app/(site)/legal/privacy/page";
import ResearchUsePage from "@/app/(site)/legal/research-use/page";
import ShippingReturnsPage from "@/app/(site)/legal/shipping-returns/page";
import TermsPage from "@/app/(site)/legal/terms/page";
import OrderSuccessPage from "@/app/(site)/order-success/page";
import ProductPage from "@/app/(site)/product/[slug]/page";
import QualityPage from "@/app/(site)/quality/page";
import QuizPage from "@/app/(site)/quiz/page";
import ShopPage from "@/app/(site)/shop/page";
import CategoryPage from "@/app/(site)/shop/[category]/page";
import VerifyPage from "@/app/(site)/verify/[slug]/page";
import VeteransPage from "@/app/(site)/veterans/page";
import NotFoundPage from "@/components/NotFoundPage";

// One-to-one with the old Next.js app/(site)/**/page.tsx file-based routes.
export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/account", element: <AccountPage /> },
      { path: "/affiliate", element: <AffiliatePage /> },
      { path: "/blog", element: <BlogPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/coa", element: <CoaPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/faq", element: <FaqPage /> },
      { path: "/legal/privacy", element: <PrivacyPage /> },
      { path: "/legal/research-use", element: <ResearchUsePage /> },
      { path: "/legal/shipping-returns", element: <ShippingReturnsPage /> },
      { path: "/legal/terms", element: <TermsPage /> },
      { path: "/order-success", element: <OrderSuccessPage /> },
      { path: "/product/:slug", element: <ProductPage /> },
      { path: "/quality", element: <QualityPage /> },
      { path: "/quiz", element: <QuizPage /> },
      { path: "/shop", element: <ShopPage /> },
      { path: "/shop/:category", element: <CategoryPage /> },
      { path: "/verify/:slug", element: <VerifyPage /> },
      { path: "/veterans", element: <VeteransPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
