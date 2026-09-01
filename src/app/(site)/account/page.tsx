"use client";

/**
 * /account — fixes the dead header link (Header.tsx has always linked here;
 * this page never existed, so it 404'd). Reuses the exact same session
 * VertalisGate.tsx already establishes (nvr_auth_token / nvr_auth_user in
 * localStorage) rather than inventing a second, parallel auth flow — signing
 * in here or through the gate leaves you signed in everywhere.
 *
 * Logged in: shows real WooCommerce order history, pulled through
 * /api/account/orders (which resolves "whose orders" from the session token
 * server-side — see that route's comment for why it can't just take a
 * customer id from the browser). Also surfaces the affiliate program, since
 * a customer and an affiliate are different account systems entirely
 * (this page vs. the separate vp-affiliate-portal deployment) and a
 * customer has no way to discover the program otherwise.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import {
  getStoredToken,
  getStoredUser,
  saveAuth,
  clearAuth,
  type AuthUser,
} from "@/components/VertalisGate";
interface WCOrder {
  id: string | number;
  number: string;
  status: string;
  total: string;
  date_created: string;
  line_items: { name?: string; quantity: number; total: string }[];
}

type AuthMode = "signin" | "register";

function OrderStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "border-yellow-400/40 text-yellow-400 bg-yellow-400/5",
    processing: "border-primary-500/40 text-primary-500 bg-primary-500/5",
    "on-hold": "border-yellow-400/40 text-yellow-400 bg-yellow-400/5",
    completed: "border-secondary-500/40 text-secondary-500 bg-secondary-500/5",
    cancelled: "border-signal/40 text-signal bg-signal/5",
    refunded: "border-foreground-500/30 text-foreground-400 bg-foreground-500/5",
  };
  const cls = map[status] ?? "border-foreground-500/30 text-foreground-400 bg-foreground-500/5";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[10px] font-mono uppercase tracking-wider whitespace-nowrap ${cls}`}>
      {status.replace(/-/g, " ")}
    </span>
  );
}

export default function AccountPage() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [orders, setOrders] = useState<WCOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // Sign in / register mini-form
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const loadOrders = async (token: string) => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const res = await fetch("/api/account/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOrdersError(data?.error || "Could not load your orders.");
        return;
      }
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setOrdersError("Network error — could not reach the server.");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = getStoredUser();
    const token = getStoredToken();
    if (storedUser && token) {
      setUser(storedUser);
      loadOrders(token);
    }
    setChecking(false);
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!email.trim() || !password) {
      setAuthError("Please fill in all required fields.");
      return;
    }
    if (mode === "register" && password !== confirm) {
      setAuthError("Passwords do not match.");
      return;
    }
    if (mode === "register" && password.length < 8) {
      setAuthError("Password must be at least 8 characters.");
      return;
    }

    setAuthLoading(true);
    try {
      const endpoint = mode === "signin" ? "login" : "register";
      const res = await fetch(`/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      saveAuth(data);
      setUser({ email: data.email, username: data.username, user_id: data.user_id });
      loadOrders(data.token);
    } catch {
      setAuthError("Network error. Please check your connection.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setOrders([]);
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
              <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">Account</span>
            </div>
            <h1 className="font-display text-[36px] md:text-[44px] leading-[0.95] tracking-tightest text-foreground-100">
              {user ? `Welcome back${user.username ? `, ${user.username}` : ""}.` : "Your Account"}
            </h1>
          </div>
        </section>

        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-12">
          {checking ? (
            <div className="flex items-center justify-center py-24">
              <span className="w-8 h-8 inline-block border-2 border-background-300 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : !user ? (
            <div className="max-w-md mx-auto">
              <div className="flex mb-6 rounded-md border border-background-200/60 overflow-hidden">
                {(["signin", "register"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setAuthError(""); }}
                    className={`flex-1 h-10 text-[12px] font-medium tracking-wide uppercase transition-colors cursor-pointer ${
                      mode === m ? "bg-primary-500 text-background-900" : "bg-background-900/50 text-foreground-400 hover:text-foreground-100"
                    }`}
                  >
                    {m === "signin" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAuthSubmit} className="rounded-lg border border-background-200/60 bg-background-900/50 p-6 space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Email Address <span className="text-signal">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@lab.edu"
                    className="w-full h-10 px-3 rounded-md bg-background-100 border border-background-200 text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 focus:border-primary-500 focus:ring-primary-500/40 transition"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Password <span className="text-signal">*</span></label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 px-3 rounded-md bg-background-100 border border-background-200 text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 focus:border-primary-500 focus:ring-primary-500/40 transition"
                  />
                </div>
                {mode === "register" && (
                  <div>
                    <label className="block text-[12px] font-medium text-foreground-300 mb-1.5">Confirm Password <span className="text-signal">*</span></label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 px-3 rounded-md bg-background-100 border border-background-200 text-foreground-100 text-sm placeholder:text-foreground-600 focus:outline-none focus:ring-1 focus:border-primary-500 focus:ring-primary-500/40 transition"
                    />
                  </div>
                )}

                {authError && (
                  <div role="alert" className="p-3 rounded-md border border-signal/30 bg-signal/5">
                    <p className="text-[12px] text-signal">{authError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full h-11 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
                </button>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-[20px] text-foreground-100">Order History</h2>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-[12px] font-medium text-foreground-400 hover:text-signal transition-colors cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <span className="w-6 h-6 inline-block border-2 border-background-300 border-t-primary-500 rounded-full animate-spin" />
                  </div>
                ) : ordersError ? (
                  <div className="p-4 rounded-md border border-signal/30 bg-signal/5">
                    <p className="text-[13px] text-signal">{ordersError}</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-8 rounded-lg border border-background-200/60 bg-background-900/50 text-center">
                    <i className="ri-shopping-bag-3-line text-[24px] text-foreground-500 mb-3 inline-block"></i>
                    <p className="text-[13px] text-foreground-400">You haven&apos;t placed any orders yet.</p>
                    <Link to="/shop" className="inline-block mt-4 text-[12px] font-medium text-primary-500 hover:text-primary-400 transition-colors">
                      Browse the Catalog →
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-lg border border-background-200/60 bg-background-900/50 divide-y divide-background-200/40 overflow-hidden">
                    {orders.map((order) => (
                      <div key={order.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                        <div className="sm:w-32 shrink-0">
                          <p className="font-mono text-[12px] text-primary-500">#{order.number}</p>
                          <p className="text-[11px] text-foreground-500 mt-0.5">
                            {new Date(order.date_created).toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-foreground-300 truncate">
                            {order.line_items.map((li) => li.name).filter(Boolean).join(", ") || `${order.line_items.length} item(s)`}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <OrderStatusPill status={order.status} />
                          <span className="font-display text-[15px] text-foreground-100 w-16 text-right">${parseFloat(order.total).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-4">
                <div className="rounded-lg border border-primary-500/25 bg-primary-500/[0.04] p-6">
                  <i className="ri-user-star-line text-[24px] text-primary-500 mb-3 inline-block"></i>
                  <h3 className="font-display text-[16px] text-foreground-100 mb-2">Longevity Peptides Affiliate Program</h3>
                  <p className="text-[13px] text-foreground-500 leading-relaxed mb-4">
                    Already buying from us? Earn commission referring other researchers — separate account, own dashboard.
                  </p>
                  <Link
                    to="/affiliate"
                    className="inline-flex items-center gap-2 text-[12px] font-medium text-primary-500 hover:text-primary-400 transition-colors"
                  >
                    Learn More <i className="ri-arrow-right-line text-[13px]"></i>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
