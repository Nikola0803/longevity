"use client";

/**
 * VertalisGate: verified-research-access wall.
 *
 * Combines three things in one gate, matching the Valkyrie pattern but in
 * Vertalis's dark lab aesthetic:
 *   1. Age verification (21+) + Research-Use-Only consent: ALWAYS required.
 *   2. Optional account Sign In / Create Account, backed by the WordPress/
 *      WooCommerce endpoints proxied through /api/auth/* (keys stay server-side).
 *   3. A guest "Verify & Enter" path so the gate works even before a CMS
 *      backend is connected.
 *
 * Access is remembered in localStorage. Children render underneath the overlay
 * (good for SEO / no layout shift); body scroll is locked until access granted.
 */

import { useState, useEffect, useRef } from "react";
import { SITE } from "@/data/site-config";

const TOKEN_KEY = "nvr_auth_token";
const USER_KEY = "nvr_auth_user";
const ACCESS_KEY = "nvr_access"; // guest consent grant
const ACCESS_TTL_DAYS = 30;

export interface AuthUser {
  email: string;
  username: string;
  user_id: number;
}

export function getStoredToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) ?? "";
}
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? "null");
  } catch {
    return null;
  }
}
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ACCESS_KEY);
}
/** Shared with app/account/page.tsx so both the gate and the account page
 *  write the exact same session shape instead of two slightly-different
 *  copies of this logic drifting apart over time. */
export function saveAuth(data: { token: string; email: string; username: string; user_id: number }) {
  try {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({ email: data.email, username: data.username, user_id: data.user_id })
    );
  } catch {
    /* ignore */
  }
}

type Mode = "verify" | "signin" | "register";

export default function VertalisGate({ children }: { children: React.ReactNode }) {
  const [granted, setGranted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<Mode>("verify");

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeEmail, setAgreeEmail] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Validate any stored access on mount.
  useEffect(() => {
    // 1) Guest consent grant still valid?
    try {
      const raw = localStorage.getItem(ACCESS_KEY);
      if (raw) {
        const { ts } = JSON.parse(raw) as { ts: number };
        if (Date.now() - ts < ACCESS_TTL_DAYS * 864e5) {
          setGranted(true);
          setChecking(false);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    // 2) Account token still valid? (only if backend configured)
    const token = getStoredToken();
    if (!token) {
      setChecking(false);
      return;
    }
    fetch("/api/auth/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.valid) setGranted(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  // Lock body scroll while the gate is showing.
  useEffect(() => {
    if (checking || granted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [checking, granted]);

  useEffect(() => {
    if (!granted && !checking) setTimeout(() => firstFieldRef.current?.focus(), 80);
  }, [granted, checking, mode]);

  if (granted || checking) {
    // Render children immediately once granted; during the brief check, keep
    // children mounted underneath a matching backdrop to avoid a flash.
    return (
      <>
        {children}
        {checking && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background-800"
            aria-hidden
          >
            <span className="w-8 h-8 inline-block border-2 border-background-300 border-t-primary-500 rounded-full animate-spin" />
          </div>
        )}
      </>
    );
  }

  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };

  const grantGuest = () => {
    try {
      localStorage.setItem(
        ACCESS_KEY,
        JSON.stringify({ ts: Date.now(), age: SITE.minimumAge, marketing: agreeEmail })
      );
    } catch {
      /* ignore */
    }
    setGranted(true);
  };

  const handleAuthSuccess = (data: { token: string; email: string; username: string; user_id: number }) => {
    saveAuth(data);
    setGranted(true);
  };

  const handleSubmit = async () => {
    setError("");
    if (!agreeTerms) {
      setError(`You must confirm you are ${SITE.minimumAge}+ and agree to the research-only terms.`);
      shake();
      return;
    }

    // Guest / verify-only path: no backend needed.
    if (mode === "verify") {
      grantGuest();
      return;
    }

    // Account paths.
    if (!email.trim() || !password) {
      setError("Please fill in all required fields.");
      shake();
      return;
    }
    if (mode === "register") {
      if (!email.includes("@")) {
        setError("Please enter a valid email address.");
        shake();
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        shake();
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        shake();
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = mode === "signin" ? "login" : "register";
      const body: Record<string, unknown> = {
        email: email.trim(),
        password,
        marketingOptIn: agreeEmail,
      };
      if (mode === "register" && username.trim()) body.username = username.trim();

      const res = await fetch(`/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
        shake();
      } else {
        handleAuthSuccess(data);
      }
    } catch {
      setError("Network error. Please check your connection.");
      shake();
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };
  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setPassword("");
    setConfirm("");
  };

  const TABS: { key: Mode; label: string }[] = [
    { key: "verify", label: "Enter Site" },
    { key: "signin", label: "Sign In" },
    { key: "register", label: "Create Account" },
  ];

  return (
    <>
      {children}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
        style={{ background: "rgba(6,7,9,0.9)", backdropFilter: "blur(10px)" }}
      >
        <div
          className="w-full flex overflow-hidden rounded-xl border border-background-200/70"
          style={{
            maxWidth: 940,
            maxHeight: "96vh",
            boxShadow: "0 40px 120px rgba(0,0,0,0.75)",
            animation: shaking ? "nvr-shake 0.6s cubic-bezier(.36,.07,.19,.97)" : undefined,
          }}
        >
          {/* Left brand panel */}
          <div
            className="hidden md:flex flex-col justify-between relative overflow-hidden bg-background-900"
            style={{ width: 360, minWidth: 360, padding: "40px 34px" }}
          >
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/vertalis-hero-bg-01.jpg"
                alt=""
                className="w-full h-full object-cover"
                style={{ objectPosition: "center 30%", opacity: 0.28 }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgb(var(--bg-900) / 0.55) 0%, rgb(var(--bg-900) / 0.2) 42%, rgb(var(--bg-900) / 0.92) 100%)",
                }}
              />
              <div className="absolute inset-0 grid-overlay opacity-20" />
            </div>

            {/* Logo */}
            <div className="relative z-10">
              <p className="font-mono text-[9px] uppercase tracking-[0.34em] text-foreground-600 mb-3">
                Verified Research Access
              </p>
              <div className="flex items-center gap-2.5">
                <span className="relative w-6 h-6 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-md border border-primary-500/50 rotate-45" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_10px_2px_rgb(var(--primary-500) / 0.6)]" />
                </span>
                <span className="font-display text-[22px] tracking-[0.28em] text-foreground-100">
                  {SITE.brand}
                </span>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-600 mt-2">
                Research Peptides
              </p>
            </div>

            {/* Trust badges */}
            <div className="relative z-10 flex flex-col gap-2.5 my-6">
              {[
                "≥99% Purity · HPLC-Verified",
                "Every Batch Third-Party Tested",
                "Public, Searchable COAs",
              ].map((b) => (
                <div key={b} className="flex items-center gap-2.5">
                  <i className="ri-checkbox-circle-fill text-[15px] text-secondary-500" />
                  <span className="text-[12px] text-foreground-400 font-medium">{b}</span>
                </div>
              ))}
            </div>

            {/* Testing partners */}
            <div className="relative z-10">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-foreground-600 mb-2">
                Tested By
              </p>
              <div className="flex items-center gap-3">
                {SITE.testingPartners.map((p, i) => (
                  <span key={p} className="flex items-center gap-3">
                    {i > 0 && <span className="w-px h-3 bg-background-300" />}
                    <span className="font-mono text-[11px] text-foreground-400">{p}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col bg-background-100 overflow-y-auto" style={{ maxHeight: "96vh" }}>
            {/* Tabs */}
            <div className="flex border-b border-background-200/70">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => switchMode(t.key)}
                  className="flex-1 py-4 text-[13px] font-semibold transition-colors cursor-pointer"
                  style={{
                    color: mode === t.key ? "rgb(var(--fg-100))" : "rgb(var(--fg-500))",
                    borderBottom: mode === t.key ? "2px solid rgb(var(--primary-500))" : "2px solid transparent",
                    marginBottom: -1,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-8 flex flex-col gap-4">
              <div>
                <h2 className="font-display text-[22px] tracking-tight text-foreground-100">
                  {mode === "verify"
                    ? "Confirm research access"
                    : mode === "signin"
                    ? "Sign in to continue"
                    : "Create your account"}
                </h2>
                <p className="text-[13px] text-foreground-500 mt-1">
                  {mode === "verify"
                    ? `You must be ${SITE.minimumAge}+ and agree to our research-only terms to browse.`
                    : "Your account keeps order history and COAs in one place."}
                </p>
              </div>

              {/* Account fields */}
              {mode !== "verify" && (
                <>
                  <Field
                    ref={firstFieldRef}
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(v) => {
                      setEmail(v);
                      setError("");
                    }}
                    onKeyDown={onKey}
                    placeholder="you@lab.edu"
                    error={!!error}
                  />

                  {mode === "register" && (
                    <Field
                      label="Username (optional)"
                      type="text"
                      value={username}
                      onChange={(v) => {
                        setUsername(v);
                        setError("");
                      }}
                      onKeyDown={onKey}
                      placeholder="Leave blank to auto-generate"
                      error={false}
                    />
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-foreground-400">Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        onKeyDown={onKey}
                        placeholder={mode === "register" ? "Min. 8 characters" : "Your password"}
                        className="w-full h-11 px-4 pr-16 rounded-md bg-background-200 border border-background-300 text-foreground-100 text-sm placeholder:text-foreground-600 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition"
                        style={{ borderColor: error ? "rgb(var(--signal))" : undefined }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-foreground-400 hover:text-foreground-100 cursor-pointer px-2 py-1 rounded bg-background-300/60"
                      >
                        {showPass ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {mode === "register" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-foreground-400">
                        Confirm Password
                      </label>
                      <input
                        type={showPass ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => {
                          setConfirm(e.target.value);
                          setError("");
                        }}
                        onKeyDown={onKey}
                        placeholder="Repeat your password"
                        className="w-full h-11 px-4 rounded-md bg-background-200 border border-background-300 text-foreground-100 text-sm placeholder:text-foreground-600 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition"
                        style={{ borderColor: error && confirm !== password ? "rgb(var(--signal))" : undefined }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* RUO + age consent box */}
              <div className="rounded-lg p-4 mt-1 bg-background-200/60 border border-background-300">
                <div className="flex items-center gap-2 mb-2">
                  <i className="ri-shield-check-line text-[15px] text-primary-500" />
                  <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-primary-500">
                    Research Use Only
                  </p>
                </div>
                <p className="text-[12px] text-foreground-400 leading-relaxed mb-1">
                  By using this site you acknowledge that all products and information are
                  provided for laboratory research purposes only and are not intended for
                  human consumption or medical use.
                </p>
                <p className="text-[12px] font-medium text-foreground-300 mb-3">
                  You must be {SITE.minimumAge} years of age or older to use this website.
                </p>

                <label className="flex items-start gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      setError("");
                    }}
                    className="mt-0.5 shrink-0 cursor-pointer w-4 h-4"
                    style={{ accentColor: "rgb(var(--primary-500))" }}
                  />
                  <span className="text-[12px] font-medium text-foreground-300 leading-snug">
                    I confirm I am {SITE.minimumAge} or older and agree to the{" "}
                    <a href="/legal/research-use" className="text-primary-500 hover:underline">
                      research-only terms
                    </a>
                    .
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeEmail}
                    onChange={(e) => setAgreeEmail(e.target.checked)}
                    className="mt-0.5 shrink-0 cursor-pointer w-4 h-4"
                    style={{ accentColor: "rgb(var(--primary-500))" }}
                  />
                  <span className="text-[12px] text-foreground-500 leading-snug">
                    Yes, I&apos;d like to receive occasional research updates from {SITE.brand}. I
                    may unsubscribe at any time.
                  </span>
                </label>
              </div>

              {error && (
                <p className="text-signal text-[12px] font-medium flex items-center gap-1.5">
                  <i className="ri-error-warning-line text-sm shrink-0" />
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-12 rounded-md font-semibold uppercase tracking-widest text-[13px] text-background-900 bg-primary-500 hover:bg-primary-400 hover:shadow-[0_0_28px_-4px_rgb(var(--primary-500) / 0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 inline-block border-2 border-background-900/30 border-t-background-900 rounded-full animate-spin" />
                    {mode === "signin" ? "Signing in…" : "Creating account…"}
                  </>
                ) : mode === "verify" ? (
                  "Enter Site"
                ) : mode === "signin" ? (
                  "Sign In & Continue"
                ) : (
                  "Create Account"
                )}
              </button>

              {mode === "signin" && (
                <p className="text-center text-[12px] text-foreground-500">
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="hover:text-foreground-200 transition-colors cursor-pointer"
                  >
                    Need an account? Create one
                  </button>
                </p>
              )}
            </div>

            {/* Bottom disclaimer */}
            <div className="px-8 py-4 bg-background-900/60 border-t border-background-200/70">
              <p className="font-display text-[12px] tracking-wide text-foreground-100 mb-0.5">
                {SITE.legalName}
              </p>
              <p className="text-[11px] text-foreground-500">{SITE.tagline}</p>
              <p className="text-[11px] text-foreground-400 mt-2 leading-relaxed">
                Access to product information is restricted to verified researchers who
                confirm the research-only terms above.
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes nvr-shake {
            0%,100%{ transform:translateX(0) }
            15%{ transform:translateX(-9px) }
            30%{ transform:translateX(9px) }
            45%{ transform:translateX(-6px) }
            60%{ transform:translateX(6px) }
            75%{ transform:translateX(-3px) }
            90%{ transform:translateX(3px) }
          }
        `}</style>
      </div>
    </>
  );
}

/* Reusable text field (dark) */
import { forwardRef } from "react";
const Field = forwardRef<
  HTMLInputElement,
  {
    label: string;
    type: string;
    value: string;
    onChange: (v: string) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    placeholder: string;
    error: boolean;
  }
>(({ label, type, value, onChange, onKeyDown, placeholder, error }, ref) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-medium text-foreground-400">{label}</label>
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoComplete={type === "email" ? "email" : type === "password" ? "current-password" : "username"}
      className="w-full h-11 px-4 rounded-md bg-background-200 border border-background-300 text-foreground-100 text-sm placeholder:text-foreground-600 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 transition"
      style={{ borderColor: error ? "rgb(var(--signal))" : undefined }}
    />
  </div>
));
Field.displayName = "Field";
