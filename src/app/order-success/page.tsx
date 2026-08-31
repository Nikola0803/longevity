import Link from "next/link";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import Footer from "@/components/Footer";

/**
 * Was fully static before (hardcoded "pay via Zelle to orders@..." no matter
 * which gateway the customer actually picked at checkout, no order number,
 * and a "Back to Catalog" button with no href at all). Checkout now passes
 * the real order number / selected gateway / handle / memo through as query
 * params on redirect — this page reads them back via the (Next 15, async)
 * searchParams prop instead of guessing.
 */
export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const orderNumber = typeof params.order === "string" ? params.order : "";
  const gatewayLabel = typeof params.label === "string" ? params.label : "your selected method";
  const handle = typeof params.handle === "string" ? params.handle : "";
  const memo = typeof params.memo === "string" ? params.memo : "";

  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner />
      <Header />
      <main className="pt-[112px]">
        <section className="w-full max-w-[640px] mx-auto px-6 py-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-secondary-500/10 border border-secondary-500/30 mb-6">
            <i className="ri-check-line text-[32px] text-secondary-500"></i>
          </div>
          <h2 className="font-display text-[28px] text-foreground-100 mb-3">Order Submitted</h2>

          {orderNumber && (
            <p className="font-mono text-[13px] tracking-[0.1em] text-primary-500 mb-4">
              Order #{orderNumber}
            </p>
          )}

          <p className="text-[14px] text-foreground-500 max-w-md mb-4">
            Your order has been received. Please complete payment via{" "}
            <strong className="text-foreground-200">{gatewayLabel}</strong>
            {handle ? (
              <>
                {" "}to <span className="font-mono text-primary-500">{handle}</span>
              </>
            ) : (
              " using the details we email you"
            )}
            {memo ? (
              <>
                {" "}and include the code <span className="font-mono text-primary-500">{memo}</span> in your payment notes for faster verification.
              </>
            ) : (
              "."
            )}
          </p>

          <p className="text-[12px] text-foreground-600 mb-8">
            Orders are typically dispatched within 24 hours of payment confirmation.
          </p>

          <Link
            href="/shop"
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
