"use client";

import { useEffect, useState } from "react";

// Root domain shown in the "name.yourplatform.com" preview. Public env so it's
// available in this client component; falls back to a readable placeholder.
const ROOT = process.env.NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN || "yourplatform.com";

const COLOR_PRESETS: { label: string; hex: string; rgb: string }[] = [
  { label: "Signal Blue", hex: "#8CB2E0", rgb: "140 178 224" },
  { label: "Peptide Green", hex: "#5AC8A0", rgb: "90 200 160" },
  { label: "Violet", hex: "#9B8CFF", rgb: "155 140 255" },
  { label: "Teal", hex: "#4FB3C4", rgb: "79 179 196" },
  { label: "Amber", hex: "#E0A65A", rgb: "224 166 90" },
  { label: "Rose", hex: "#E06A8C", rgb: "224 106 140" },
];

function hexToRgbTriplet(hex: string): string | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
}

function slugifyClient(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 63);
}

type Availability = { state: "idle" | "checking" | "ok" | "taken" | "invalid"; reason?: string };

export default function OnboardPage() {
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [subTouched, setSubTouched] = useState(false);
  const [avail, setAvail] = useState<Availability>({ state: "idle" });

  const [customDomain, setCustomDomain] = useState("");
  const [colorRgb, setColorRgb] = useState(COLOR_PRESETS[0].rgb);

  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<{ url: string; error?: string } | null>(null);

  // Auto-fill the subdomain from the name until the user edits it directly.
  useEffect(() => {
    if (!subTouched) setSubdomain(slugifyClient(name));
  }, [name, subTouched]);

  // Debounced availability check.
  useEffect(() => {
    if (!subdomain) {
      setAvail({ state: "idle" });
      return;
    }
    setAvail({ state: "checking" });
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/onboard/check-subdomain?slug=${encodeURIComponent(subdomain)}`);
        const data = await res.json();
        if (data.available) setAvail({ state: "ok" });
        else setAvail({ state: data.reason?.includes("taken") ? "taken" : "invalid", reason: data.reason });
      } catch {
        setAvail({ state: "invalid", reason: "Could not check availability." });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [subdomain]);

  const canContinueStep0 = name.trim().length > 1 && avail.state === "ok";

  async function launch() {
    setCreating(true);
    setResult(null);
    try {
      const res = await fetch("/api/onboard/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          subdomain,
          customDomain: customDomain.trim() || null,
          templateId: "classic",
          primaryColorRgb: colorRgb,
        }),
      });
      const data = await res.json();
      if (data.ok) setResult({ url: data.url });
      else setResult({ url: "", error: data.error || "Something went wrong." });
    } catch {
      setResult({ url: "", error: "Network error. Try again." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-background-800 text-foreground-100 font-sans antialiased">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-foreground-500">Launch your store</div>
          <h1 className="mt-2 font-display text-3xl font-semibold">Set up your peptide storefront</h1>
          <p className="mt-2 text-foreground-400">
            Pick a name, choose how customers reach you, and go live in minutes. Your store sells our
            catalog at your prices, and we handle fulfillment.
          </p>
        </div>

        <Steps step={step} />

        <div className="mt-8 rounded-lg border border-accent-300/10 bg-background-100/60 p-6">
          {/* STEP 0, name + address */}
          {step === 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground-200">Store name</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Research"
                className="mt-2 w-full rounded-md border border-accent-300/15 bg-background-800 px-3 py-2.5 outline-none focus:border-primary-500"
              />

              <label className="mt-6 block text-sm font-medium text-foreground-200">Store address</label>
              <div className="mt-2 flex items-stretch overflow-hidden rounded-md border border-accent-300/15 bg-background-800 focus-within:border-primary-500">
                <input
                  value={subdomain}
                  onChange={(e) => {
                    setSubTouched(true);
                    setSubdomain(slugifyClient(e.target.value));
                  }}
                  placeholder="your-store"
                  className="w-full bg-transparent px-3 py-2.5 outline-none"
                />
                <span className="flex items-center whitespace-nowrap bg-background-200 px-3 text-sm text-foreground-400">
                  .{ROOT}
                </span>
              </div>
              <div className="mt-2 h-5 text-sm">
                {avail.state === "checking" && <span className="text-foreground-500">Checking...</span>}
                {avail.state === "ok" && (
                  <span className="text-secondary-500">
                    {subdomain}.{ROOT} is available
                  </span>
                )}
                {(avail.state === "taken" || avail.state === "invalid") && (
                  <span className="text-signal">{avail.reason}</span>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <NextBtn disabled={!canContinueStep0} onClick={() => setStep(1)} />
              </div>
            </div>
          )}

          {/* STEP 1, domain choice */}
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-foreground-200">
                Use your own domain (optional)
              </label>
              <input
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value.trim())}
                placeholder="www.yourbrand.com"
                className="mt-2 w-full rounded-md border border-accent-300/15 bg-background-800 px-3 py-2.5 outline-none focus:border-primary-500"
              />
              <p className="mt-3 text-sm text-foreground-400">
                Leave this blank and your store stays live at{" "}
                <span className="font-mono text-foreground-200">
                  {subdomain || "your-store"}.{ROOT}
                </span>
                . Connect a custom domain now or later; either way the subdomain keeps working as a
                fallback, so your store is never down waiting on DNS.
              </p>
              {customDomain && (
                <p className="mt-2 text-sm text-foreground-500">
                  After launch, point <span className="font-mono text-foreground-300">{customDomain}</span> at us
                  with a CNAME. Until then, customers use your{" "}
                  <span className="font-mono text-foreground-300">.{ROOT}</span> address.
                </p>
              )}

              <div className="mt-6 flex justify-between">
                <BackBtn onClick={() => setStep(0)} />
                <NextBtn onClick={() => setStep(2)} />
              </div>
            </div>
          )}

          {/* STEP 2, look */}
          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-foreground-200">Template</label>
              <div className="mt-2 rounded-md border border-primary-500/60 bg-background-800 p-4">
                <div className="font-medium">Classic storefront</div>
                <div className="text-sm text-foreground-400">
                  Clean catalog, COA verification, cart, and checkout. More templates soon.
                </div>
              </div>

              <label className="mt-6 block text-sm font-medium text-foreground-200">Accent color</label>
              <div className="mt-3 flex flex-wrap gap-3">
                {COLOR_PRESETS.map((c) => {
                  const selected = c.rgb === colorRgb;
                  return (
                    <button
                      key={c.hex}
                      onClick={() => setColorRgb(c.rgb)}
                      title={c.label}
                      className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-background-100 transition ${
                        selected ? "ring-foreground-100" : "ring-transparent hover:ring-accent-300/30"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  );
                })}
                <label
                  className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-accent-300/20 px-3 text-sm text-foreground-400"
                  title="Custom color"
                >
                  Custom
                  <input
                    type="color"
                    className="h-5 w-5 cursor-pointer bg-transparent p-0"
                    onChange={(e) => {
                      const rgb = hexToRgbTriplet(e.target.value);
                      if (rgb) setColorRgb(rgb);
                    }}
                  />
                </label>
              </div>

              {/* live swatch preview */}
              <div className="mt-5 flex items-center gap-3">
                <span
                  className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-background-800"
                  style={{ backgroundColor: `rgb(${colorRgb})` }}
                >
                  Add to Cart
                </span>
                <span className="text-sm text-foreground-500">This is how your buttons will look.</span>
              </div>

              <div className="mt-6 flex justify-between">
                <BackBtn onClick={() => setStep(1)} />
                <NextBtn onClick={() => setStep(3)} />
              </div>
            </div>
          )}

          {/* STEP 3, review, launch, done */}
          {step === 3 && (
            <div>
              {!result && (
                <>
                  <div className="text-sm font-medium text-foreground-200">Review</div>
                  <dl className="mt-3 space-y-2 text-sm">
                    <Row k="Store" v={name} />
                    <Row k="Address" v={`${subdomain}.${ROOT}`} />
                    <Row k="Custom domain" v={customDomain || "None (using subdomain)"} />
                    <Row k="Template" v="Classic storefront" />
                    <Row
                      k="Accent"
                      v={
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="inline-block h-4 w-4 rounded-full"
                            style={{ backgroundColor: `rgb(${colorRgb})` }}
                          />
                          rgb({colorRgb})
                        </span>
                      }
                    />
                  </dl>

                  <div className="mt-6 flex justify-between">
                    <BackBtn onClick={() => setStep(2)} disabled={creating} />
                    <button
                      onClick={launch}
                      disabled={creating}
                      className="rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-800 transition hover:opacity-90 disabled:opacity-50"
                    >
                      {creating ? "Building your store..." : "Launch store"}
                    </button>
                  </div>
                </>
              )}

              {result?.error && (
                <div>
                  <div className="text-signal">{result.error}</div>
                  <div className="mt-4">
                    <BackBtn onClick={() => setResult(null)} />
                  </div>
                </div>
              )}

              {result && !result.error && (
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary-500/15 text-secondary-500">
                    <i className="ri-check-line text-2xl" />
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-semibold">Your store is live</h2>
                  <p className="mt-2 text-foreground-400">Open it, it is already selling our catalog at your prices.</p>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-block rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-800 transition hover:opacity-90"
                  >
                    Open {result.url.replace(/^https?:\/\//, "")}
                  </a>
                  {customDomain && (
                    <p className="mt-4 text-sm text-foreground-500">
                      Your custom domain <span className="font-mono">{customDomain}</span> goes live once its DNS
                      points here. Until then use the address above.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Steps({ step }: { step: number }) {
  const labels = ["Name", "Domain", "Look", "Launch"];
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => (
        <div key={label} className="flex flex-1 items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
              i <= step ? "bg-primary-500 text-background-800" : "bg-background-200 text-foreground-500"
            }`}
          >
            {i + 1}
          </div>
          <span className={`text-sm ${i <= step ? "text-foreground-200" : "text-foreground-500"}`}>{label}</span>
          {i < labels.length - 1 && <div className="mx-1 h-px flex-1 bg-accent-300/15" />}
        </div>
      ))}
    </div>
  );
}

function NextBtn({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-800 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Continue
    </button>
  );
}

function BackBtn({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-accent-300/20 px-5 py-2.5 text-sm font-medium text-foreground-300 transition hover:bg-background-200 disabled:opacity-40"
    >
      Back
    </button>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-accent-300/10 pb-2">
      <dt className="text-foreground-500">{k}</dt>
      <dd className="text-right text-foreground-100">{v}</dd>
    </div>
  );
}
