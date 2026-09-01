import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import Footer from "@/components/Footer";

/**
 * Landing page after a NiftiPay checkout — the plugin's build_return_url()
 * sends the customer here (?order=<wc order id>&order_key=<wc order key>)
 * once they've paid on NiftiPay's hosted page. This redirect is UI-only:
 * the order's real status was already set by NiftiPay's webhook hitting
 * WordPress directly, not by the customer arriving here, so this page just
 * displays the order reference — it never marks anything paid itself.
 */
export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "";

  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner />
      <Header />
      <main className="pt-[96px]">
        <section className="w-full max-w-[640px] mx-auto px-6 py-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-secondary-500/10 border border-secondary-500/30 mb-6">
            <i className="ri-check-line text-[32px] text-secondary-500"></i>
          </div>
          <h2 className="font-display text-[28px] text-foreground-100 mb-3">Thank you for your order</h2>

          {orderNumber && (
            <p className="font-mono text-[13px] tracking-[0.1em] text-primary-500 mb-4">
              Order #{orderNumber}
            </p>
          )}

          <p className="text-[14px] text-foreground-500 max-w-md mb-4">
            Your payment has been received and your order is being processed. A confirmation email is on its way.
          </p>

          <p className="text-[12px] text-foreground-600 mb-8">
            Orders are typically dispatched within 24 hours of payment confirmation.
          </p>

          <Link
            to="/shop"
            className="h-11 px-6 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer whitespace-nowrap inline-flex items-center justify-center"
          >
            Back to Catalog
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
