"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import Footer from "@/components/Footer";
import CheckoutSummary from "@/components/CheckoutSummary";
import { useCart } from "@/lib/cart-context";
import { SITE } from "@/data/site-config";
import { getReferralCode } from "@/lib/affiliate";
import { DEFAULT_SHIPPING_RATES, shippingOptions, type ShippingRates } from "@/lib/shipping";

const COUNTRIES = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "GB", label: "United Kingdom" },
] as const;

const CA_PROVINCES = [
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const MEMO_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // avoids ambiguous 0/O/1/I/L
const RESERVATION_MS = 2 * 60 * 60 * 1000; // 2 hours

function generateMemo() {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += MEMO_CHARS[Math.floor(Math.random() * MEMO_CHARS.length)];
  }
  return code;
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const GATEWAYS = [
  {
    id: "cashapp",
    label: "Cash App",
    icon: "ri-money-dollar-circle-line",
    handle: SITE.paymentHandles.cashapp,
    handleNote: "Send as a personal payment, not \"for goods and services.\"",
  },
  {
    id: "zelle",
    label: "Zelle",
    icon: "ri-bank-line",
    handle: SITE.paymentHandles.zelle,
    handleNote: "Zelle transfers are instant and free between US banks.",
  },
  {
    id: "venmo",
    label: "Venmo",
    icon: "ri-smartphone-line",
    handle: SITE.paymentHandles.venmo,
    handleNote: "Send via Friends & Family. Do not use Goods & Services.",
  },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, subtotal } = useCart();

  const [selectedGateway, setSelectedGateway] = useState<(typeof GATEWAYS)[number]["id"] | null>(null);
  const [memo, setMemo] = useState(() => generateMemo());
  const [expiresAt, setExpiresAt] = useState(() => Date.now() + RESERVATION_MS);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [handleCopied, setHandleCopied] = useState(false);

  // Shipping fields — previously uncontrolled (defaultValue="", no state),
  // meaning nothing the customer typed was ever captured. Now backing
  // createOrder()'s billing/shipping payload below.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState<"US" | "CA" | "GB">("US");
  const [stateCode, setStateCode] = useState("");
  const [zip, setZip] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [shippingRates, setShippingRates] = useState<ShippingRates>(DEFAULT_SHIPPING_RATES);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "expedited" | "overnight" | "international">("standard");

  useEffect(() => {
    fetch("/api/store/shipping-rates")
      .then((r) => r.json())
      .then((rates) => {
        if (rates && typeof rates.standardCents === "number") setShippingRates(rates);
      })
      .catch(() => {});
  }, []);

  const stateRequired = country !== "GB";
  const shippingComplete = Boolean(
    firstName.trim() && lastName.trim() && email.trim() && phone.trim() &&
    address1.trim() && city.trim() && (!stateRequired || stateCode) && zip.trim()
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remainingMs = expiresAt - now;
  const expired = remainingMs <= 0;

  const handleRegenerate = () => {
    setMemo(generateMemo());
    setExpiresAt(Date.now() + RESERVATION_MS);
  };

  const handleCopyMemo = async () => {
    try {
      await navigator.clipboard.writeText(memo);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable. Code is still visible to copy manually.
    }
  };

  const selectedGatewayInfo = GATEWAYS.find((g) => g.id === selectedGateway) ?? null;
  const subtotalCents = Math.round(subtotal * 100);
  // Outside the US it's always a flat DHL rate — one option, no tiers.
  const shipOptions = shippingOptions(subtotalCents, shippingRates, country);
  const selectedShippingCents = shipOptions.find((o) => o.id === shippingMethod)?.cents ?? shipOptions[0]?.cents ?? 0;

  useEffect(() => {
    if (!shipOptions.some((o) => o.id === shippingMethod)) {
      setShippingMethod(shipOptions[0]?.id ?? "standard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const handleCopyGatewayHandle = async () => {
    if (!selectedGatewayInfo?.handle) return;
    try {
      await navigator.clipboard.writeText(selectedGatewayInfo.handle);
      setHandleCopied(true);
      window.setTimeout(() => setHandleCopied(false), 1800);
    } catch {
      // Clipboard API unavailable. Handle is still visible to copy manually.
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !selectedGateway || expired || !shippingComplete || placing) return;
    setOrderError("");
    setPlacing(true);

    try {
      const gatewayInfo = GATEWAYS.find((g) => g.id === selectedGateway)!;

      // Places the order directly against the CRM/CMS database — no more
      // relaying through an external WooCommerce site. See
      // src/lib/order-engine.ts for the transaction (stock, coupon,
      // affiliate commission) this triggers server-side.
      const res = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ slug: item.slug, quantity: item.qty })),
          paymentMethod: selectedGateway,
          paymentMemo: memo,
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
            zip: zip.trim(),
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
        gateway: selectedGateway,
        label: gatewayInfo.label,
        handle: gatewayInfo.handle || "",
        memo,
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
        <section className="pt-[112px] bg-background-900 border-b border-background-200/60">
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
                      <input placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40" type="tel" />
                    </div>
                    <div className="sm:col-span-2 relative">
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Country <span className="text-signal">*</span></label>
                      <select
                        value={country}
                        onChange={(e) => {
                          setCountry(e.target.value as "US" | "CA" | "GB");
                          setStateCode("");
                        }}
                        className="w-full h-10 px-3 rounded-md bg-background-100 border text-sm transition cursor-pointer border-background-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40 appearance-none"
                        style={{ color: "rgb(var(--fg-100))" }}
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code} style={{ color: "#000" }}>{c.label}</option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-[10px] text-foreground-600">We currently ship to the US, Canada, and the UK only.</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Street Address <span className="text-signal">*</span></label>
                      <input placeholder="123 Research Blvd, Suite 100" value={address1} onChange={(e) => setAddress1(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40" type="text" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">
                        {country === "GB" ? "Town / City" : "City"} <span className="text-signal">*</span>
                      </label>
                      <input placeholder={country === "GB" ? "London" : "Boston"} value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40" type="text" />
                    </div>
                    <div className="relative">
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">
                        {country === "US" ? "State" : country === "CA" ? "Province" : "County"}
                        {stateRequired && <span className="text-signal"> *</span>}
                        {!stateRequired && <span className="text-foreground-600"> (optional)</span>}
                      </label>
                      {country === "GB" ? (
                        <input
                          placeholder="Greater London"
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
                          <option value="" disabled>{country === "US" ? "Select state…" : "Select province…"}</option>
                          {(country === "US" ? US_STATES : CA_PROVINCES).map((s) => (
                            <option key={s} value={s} style={{ color: "#000" }}>{s}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">
                        {country === "GB" ? "Postcode" : country === "CA" ? "Postal Code" : "ZIP Code"} <span className="text-signal">*</span>
                      </label>
                      <input placeholder={country === "GB" ? "SW1A 1AA" : country === "CA" ? "M5V 3L9" : "02110"} maxLength={10} value={zip} onChange={(e) => setZip(e.target.value)} className="w-full h-10 px-3 rounded-md bg-background-100 border text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 transition border-background-200 focus:border-primary-500 focus:ring-primary-500/40" type="text" />
                    </div>
                  </div>
                  <div className="mt-5 flex items-start gap-3 p-3 rounded-md bg-background-100/40 border border-background-200/60">
                    <input type="checkbox" id="sms-consent" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0 accent-primary-500 cursor-pointer" />
                    <label htmlFor="sms-consent" className="text-[11px] text-foreground-500 leading-relaxed cursor-pointer">By checking this box, you agree to receive text messages from Vertalis Peptides at the number provided. Consent is not a condition to purchase. Message frequency varies. Message and data rates may apply. Reply STOP to cancel or HELP for help. View our <a href="https://vertalispeptides.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-400 underline transition-colors">Privacy Policy</a> and <a href="https://vertalispeptides.com/legal/terms" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-400 underline transition-colors">Terms of Service</a>.</label>
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
                    showFreeShippingProgress={country === "US"}
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
                  <p className="mt-2 text-[10px] text-foreground-600">Try <span className="font-mono text-foreground-500">VERTALIS10</span>, <span className="font-mono text-foreground-500">LABVIP</span>, or <span className="font-mono text-foreground-500">WELCOME5</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-[10px] tracking-[0.22em] text-primary-500">02</span>
                <h2 className="font-display text-[20px] text-foreground-100">Payment Method</h2>
              </div>
              <form className="space-y-6" onSubmit={handlePlaceOrder}>
                <div className="grid grid-cols-3 gap-3">
                  {GATEWAYS.map((gw) => {
                    const active = selectedGateway === gw.id;
                    return (
                      <button
                        key={gw.id}
                        type="button"
                        onClick={() => {
                          setSelectedGateway(gw.id);
                          setHandleCopied(false);
                        }}
                        aria-pressed={active}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                          active
                            ? "border-primary-500 bg-primary-500/10 shadow-[0_0_20px_-6px_rgb(var(--primary-500) / 0.5)]"
                            : "border-background-200/60 bg-background-100/50 hover:border-background-300"
                        }`}
                      >
                        {active && (
                          <i className="ri-checkbox-circle-fill absolute top-2 right-2 text-[14px] text-primary-500"></i>
                        )}
                        <i className={`${gw.icon} text-[22px] ${active ? "text-primary-500" : "text-foreground-400"}`}></i>
                        <span className={`text-[12px] font-medium ${active ? "text-primary-500" : "text-foreground-400"}`}>{gw.label}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedGatewayInfo && (
                  <div className="rounded-lg border border-background-200/60 bg-background-100/40 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <i className={`${selectedGatewayInfo.icon} text-[15px] text-primary-500`}></i>
                      <span className="text-[12px] font-medium text-foreground-200">Send your {selectedGatewayInfo.label} payment to</span>
                    </div>
                    {selectedGatewayInfo.handle ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="flex-1 h-11 px-4 rounded-md bg-background-100 border border-primary-500/40 flex items-center font-mono text-[15px] text-primary-500 truncate">
                            {selectedGatewayInfo.handle}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyGatewayHandle}
                            className="h-11 px-4 rounded-md bg-background-100 border border-background-200 text-foreground-300 text-[12px] font-medium hover:border-primary-500 hover:text-primary-500 transition-all cursor-pointer whitespace-nowrap"
                          >
                            {handleCopied ? "Copied ✓" : "Copy"}
                          </button>
                        </div>
                        <p className="mt-2 text-[11px] text-foreground-500 leading-relaxed">{selectedGatewayInfo.handleNote}</p>
                      </>
                    ) : (
                      <p className="text-[12px] text-foreground-500 leading-relaxed flex items-start gap-2">
                        <i className="ri-mail-send-line text-[14px] text-primary-500 mt-0.5 shrink-0"></i>
                        We&#39;ll email your {selectedGatewayInfo.label} payment details right after you place this order, along with your memo code below.
                      </p>
                    )}
                  </div>
                )}

                <div className="rounded-lg border border-primary-500/25 bg-primary-500/[0.04] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[13px] font-medium text-foreground-200">Payment Memo</label>
                    {!expired ? (
                      <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-yellow-400/90">
                        <i className="ri-time-line text-[12px]"></i>
                        Reserved {formatCountdown(remainingMs)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-signal">
                        <i className="ri-error-warning-line text-[12px]"></i>
                        Reservation expired
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex-1 h-11 px-4 rounded-md bg-background-100 border flex items-center font-mono text-[18px] tracking-[0.35em] ${expired ? "border-background-200 text-foreground-600" : "border-primary-500/40 text-primary-500"}`}>
                      {memo}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyMemo}
                      disabled={expired}
                      className="h-11 px-4 rounded-md bg-background-100 border border-background-200 text-foreground-300 text-[12px] font-medium hover:border-primary-500 hover:text-primary-500 transition-all cursor-pointer whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {copied ? "Copied ✓" : "Copy"}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-foreground-500 leading-relaxed">
                    Include this exact code in your {selectedGateway ? GATEWAYS.find((g) => g.id === selectedGateway)?.label : "payment"} note so we can match your payment and dispatch faster. Your items are held for 2 hours. After that, stock releases back to general inventory.
                  </p>
                  {expired && (
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      className="mt-3 h-9 px-4 rounded-md bg-primary-500/10 border border-primary-500/40 text-primary-500 text-[11px] font-medium hover:bg-primary-500/20 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-refresh-line mr-1.5"></i>Generate New Code
                    </button>
                  )}
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
                  disabled={items.length === 0 || !selectedGateway || expired || !shippingComplete || placing}
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
