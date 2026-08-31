"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import CheckoutSummary from "@/components/CheckoutSummary";
import { useCart } from "@/lib/cart-context";
import { getReferralCode } from "@/lib/affiliate";
import { DEFAULT_SHIPPING_RATES, shippingOptions, type ShippingRates } from "@/lib/shipping";

const COUNTRIES = [
  { code: "AU", label: "Australia" },
  { code: "NZ", label: "New Zealand" },
] as const;

const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, subtotal } = useCart();

  // Shipping fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState<"AU" | "NZ">("AU");
  const [stateCode, setStateCode] = useState("");
  const [postcode, setPostcode] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [shippingRates, setShippingRates] = useState<ShippingRates>(DEFAULT_SHIPPING_RATES);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "expedited" | "overnight" | "international">("standard");

  // Card fields — UI only for now (see src/app/api/store/checkout/route.ts,
  // not yet wired to a real payment processor).
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  useEffect(() => {
    fetch("/api/store/shipping-rates")
      .then((r) => r.json())
      .then((rates) => {
        if (rates && typeof rates.standardCents === "number") setShippingRates(rates);
      })
      .catch(() => {});
  }, []);

  const stateRequired = country === "AU";
  const shippingComplete = Boolean(
    firstName.trim() && lastName.trim() && email.trim() && phone.trim() &&
    address1.trim() && city.trim() && (!stateRequired || stateCode) && postcode.trim()
  );
  const cardComplete = Boolean(
    cardName.trim() && cardNumber.replace(/\s/g, "").length >= 15 && cardExpiry.trim() && cardCvc.trim()
  );

  const subtotalCents = Math.round(subtotal * 100);
  const shipOptions = shippingOptions(subtotalCents, shippingRates, country);
  const selectedShippingCents = shipOptions.find((o) => o.id === shippingMethod)?.cents ?? shipOptions[0]?.cents ?? 0;

  useEffect(() => {
    if (!shipOptions.some((o) => o.id === shippingMethod)) {
      setShippingMethod(shipOptions[0]?.id ?? "standard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !shippingComplete || !cardComplete || placing) return;
    setOrderError("");
    setPlacing(true);

    try {
      const res = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ slug: item.slug, quantity: item.qty })),
          paymentMethod: "card",
          shippingMethod,
          customerNote: orderNotes.trim() || undefined,
          affiliateRef: getReferralCode() ?? undefined,
          billing: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address1: address1.trim(),
            city: city.trim(),
            state: stateCode,
            postcode: postcode.trim(),
            country,
          },
        }),
      });
      const order = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(order?.error || "Something went wrong placing your order. Please try again.");
      }

      clearCart();

      const params = new URLSearchParams({
        order: order.number || String(order.id),
        gateway: "card",
      });
      router.push(`/order-success?${params.toString()}`);
    } catch (err) {
      setOrderError(
        err instanceof Error ? err.message : "Something went wrong placing your order. Please try again."
      );
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner />
      <Header />
      <main>
        <section className="pt-[96px] bg-background-900 border-b border-background-200/60">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-12">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-px bg-primary-500/60"></span>
              <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">Checkout</span>
            </div>
            <h1 className="font-display text-[36px] md:text-[44px] leading-[0.95] tracking-tightest text-foreground-100">Review &amp; Complete Order</h1>

            {/* Flow tracker */}
            <div className="flex items-center gap-2 mt-7">
              {[
                { n: "01", label: "Shipping" },
                { n: "02", label: "Payment" },
                { n: "03", label: "Confirmation" },
              ].map((step, i) => (
                <div key={step.n} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 ${i === 2 ? "opacity-40" : ""}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] ${i < 2 ? "bg-primary-500 text-background-900" : "border border-background-300 text-foreground-500"}`}>
                      {i < 2 ? <i className="ri-check-line text-[11px]"></i> : step.n}
                    </span>
                    <span className={`text-[11px] font-medium ${i < 2 ? "text-foreground-200" : "text-foreground-500"}`}>{step.label}</span>
                  </div>
                  {i < 2 && <span className="w-8 h-px bg-primary-500/40"></span>}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">
            <div className="md:col-span-7 flex flex-col gap-10">
              <div className="md:sticky md:top-[130px] md:max-h-[calc(100vh-160px)] md:overflow-y-auto md:pr-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-[10px] tracking-[0.22em] text-primary-500">01</span>
                  <h2 className="font-display text-[20px] text-foreground-100">Shipping Information</h2>
                </div>
                <p className="text-[12px] text-foreground-500 mb-6">All fields marked with * are required.</p>
                <div className="rounded-lg border border-background-200/60 bg-background-900/50 p-5 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">First Name <span className="text-signal">*</span></label>
                      <input placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40" type="text" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Last Name <span className="text-signal">*</span></label>
                      <input placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40" type="text" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Email Address <span className="text-signal">*</span></label>
                      <input placeholder="you@lab.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40" type="email" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Phone Number <span className="text-signal">*</span></label>
                      <input placeholder="+61 400 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40" type="tel" />
                    </div>
                    <div className="sm:col-span-2 relative">
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Country <span className="text-signal">*</span></label>
                      <select
                        value={country}
                        onChange={(e) => {
                          setCountry(e.target.value as "AU" | "NZ");
                          setStateCode("");
                        }}
                        className="w-full h-10 px-3 rounded-md bg-background-100 border text-sm transition cursor-pointer border-background-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40 appearance-none"
                        style={{ color: "rgb(var(--fg-100))" }}
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code} style={{ color: "#000" }}>{c.label}</option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-[10px] text-foreground-600">We currently ship to Australia and New Zealand only.</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Street Address <span className="text-signal">*</span></label>
                      <input placeholder="123 Research Blvd" value={address1} onChange={(e) => setAddress1(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40" type="text" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">
                        {country === "NZ" ? "Town / City" : "Suburb"} <span className="text-signal">*</span>
                      </label>
                      <input placeholder={country === "NZ" ? "Auckland" : "Sydney"} value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40" type="text" />
                    </div>
                    <div className="relative">
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">
                        {country === "AU" ? "State" : "Region"}
                        {stateRequired && <span className="text-signal"> *</span>}
                        {!stateRequired && <span className="text-foreground-600"> (optional)</span>}
                      </label>
                      {country === "NZ" ? (
                        <input
                          placeholder="Auckland Region"
                          value={stateCode}
                          onChange={(e) => setStateCode(e.target.value)}
                          className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40"
                          type="text"
                        />
                      ) : (
                        <select
                          value={stateCode}
                          onChange={(e) => setStateCode(e.target.value)}
                          className="w-full h-10 px-3 rounded-md bg-background-100 border text-sm transition cursor-pointer border-background-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40 appearance-none"
                          style={{ color: stateCode ? "rgb(var(--fg-100))" : "rgb(var(--fg-600))" }}
                        >
                          <option value="" disabled>Select state…</option>
                          {AU_STATES.map((s) => (
                            <option key={s} value={s} style={{ color: "#000" }}>{s}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Postcode <span className="text-signal">*</span></label>
                      <input placeholder={country === "NZ" ? "1010" : "2000"} maxLength={10} value={postcode} onChange={(e) => setPostcode(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40" type="text" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="mb-8">
                <div className="rounded-lg border border-primary-500/25 bg-background-900/70 overflow-hidden" style={{ boxShadow: "0 30px 70px -30px rgba(0,0,0,0.55)" }}>
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-background-200/50" style={{ background: "rgb(var(--primary-500) / 0.05)" }}>
                    <div className="flex items-center gap-2">
                      <i className="ri-shopping-bag-3-line text-[15px] text-primary-500"></i>
                      <span className="font-display text-[15px] text-foreground-100">Your Order</span>
                    </div>
                    <span className="font-mono text-[10px] tracking-wider text-foreground-500">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <CheckoutSummary
                    shippingCents={selectedShippingCents}
                    freeShippingThreshold={shippingRates.freeThresholdCents / 100}
                    showFreeShippingProgress={country === "AU"}
                  />
                </div>
              </div>
              <div className="mb-8">
                <h3 className="font-display text-[15px] text-foreground-200 mb-3">Shipping Method</h3>
                <div className="rounded-lg border border-background-200/60 bg-background-900/50 p-4 space-y-2.5">
                  {shipOptions.map((opt) => {
                    const active = shippingMethod === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setShippingMethod(opt.id)}
                        aria-pressed={active}
                        className={`w-full flex items-center justify-between gap-3 p-3 rounded-md border transition-all cursor-pointer text-left ${
                          active ? "border-primary-500 bg-primary-500/10" : "border-background-200/60 hover:border-background-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <i className={`${active ? "ri-radio-button-fill text-primary-500" : "ri-radio-button-line text-foreground-500"} text-[16px]`} />
                          <div>
                            <div className={`text-[13px] font-medium ${active ? "text-primary-500" : "text-foreground-200"}`}>{opt.label}</div>
                            <div className="text-[11px] text-foreground-500">{opt.note}</div>
                          </div>
                        </div>
                        <span className={`text-[13px] font-mono ${active ? "text-primary-500" : "text-foreground-300"}`}>
                          {opt.cents === 0 ? "Free" : `$${(opt.cents / 100).toFixed(2)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mb-8">
                <h3 className="font-display text-[15px] text-foreground-200 mb-3">Coupon Code</h3>
                <div className="rounded-lg border border-background-200/60 bg-background-900/50 p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <i className="ri-coupon-line absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-foreground-500"></i>
                      <input placeholder="Enter coupon code" className="w-full h-10 pl-9 pr-3 rounded-md bg-background-100 border border-background-200 text-foreground-100 text-sm placeholder:text-foreground-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40 transition font-mono" type="text" defaultValue="" />
                    </div>
                    <button type="button" className="h-10 px-4 rounded-md bg-background-100 border border-background-200 text-foreground-300 text-[12px] font-medium hover:border-primary-500 hover:text-primary-500 transition-all cursor-pointer whitespace-nowrap">Apply</button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-[10px] tracking-[0.22em] text-primary-500">02</span>
                <h2 className="font-display text-[20px] text-foreground-100">Payment Method</h2>
              </div>
              <form className="space-y-6" onSubmit={handlePlaceOrder}>
                <div className="rounded-lg border border-primary-500/25 bg-primary-500/[0.04] p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <i className="ri-bank-card-line text-[16px] text-primary-500"></i>
                    <span className="text-[13px] font-medium text-foreground-200">Credit / Debit Card</span>
                    <span className="ml-auto flex items-center gap-1.5 text-foreground-500">
                      <i className="ri-visa-line text-[18px]"></i>
                      <i className="ri-mastercard-line text-[18px]"></i>
                    </span>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Name on Card <span className="text-signal">*</span></label>
                    <input placeholder="John Doe" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40" type="text" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Card Number <span className="text-signal">*</span></label>
                    <input placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40 font-mono" type="text" inputMode="numeric" maxLength={19} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Expiry <span className="text-signal">*</span></label>
                      <input placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40 font-mono" type="text" maxLength={5} />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">CVC <span className="text-signal">*</span></label>
                      <input placeholder="123" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40 font-mono" type="text" inputMode="numeric" maxLength={4} />
                    </div>
                  </div>
                  <p className="text-[11px] text-foreground-500 leading-relaxed flex items-start gap-1.5">
                    <i className="ri-lock-line text-[12px] mt-0.5 shrink-0"></i>
                    Payments are processed securely. Your card details are never stored on our servers.
                  </p>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-foreground-200 mb-2">Order Notes <span className="text-foreground-500 font-normal">(optional)</span></label>
                  <textarea
                    maxLength={500}
                    rows={3}
                    placeholder="Any special instructions or notes..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-md bg-background-100 border border-background-200 text-foreground-100 text-sm placeholder:text-foreground-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40 transition resize-none"
                  ></textarea>
                  <p className="mt-1 text-[10px] text-foreground-600 text-right">{orderNotes.length}/500</p>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-md bg-yellow-400/5 border border-yellow-400/20">
                  <i className="ri-information-line text-[14px] text-yellow-400/70 mt-0.5"></i>
                  <p className="text-[11px] text-foreground-500 leading-relaxed">By placing this order, you confirm that all products are purchased for laboratory research use only, in accordance with our Terms of Service.</p>
                </div>

                {orderError && (
                  <div role="alert" className="flex items-start gap-2 p-3 rounded-md bg-signal/5 border border-signal/30">
                    <i className="ri-error-warning-line text-[14px] text-signal mt-0.5"></i>
                    <p className="text-[11px] text-signal leading-relaxed">{orderError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={items.length === 0 || !shippingComplete || !cardComplete || placing}
                  className="w-full h-12 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all duration-300 ease-precision hover:shadow-[0_0_24px_-4px_rgb(var(--primary-500) / 0.6)] flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {placing ? (
                    <>
                      <span className="w-3.5 h-3.5 inline-block border-2 border-background-900/30 border-t-background-900 rounded-full animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    <>
                      <i className="ri-lock-line text-[14px]"></i>Confirm Order · ${(subtotal + selectedShippingCents / 100).toFixed(2)}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
