"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * Markets/regions — ported from longevity-peps' regionStore.ts (Zustand) as
 * plain React context to avoid an extra dependency. Indicative conversion
 * rates only; replace with live FX or Woo per-market pricing when available.
 */
export type RegionCode = "AU" | "NZ" | "US";

export interface Region {
  code: RegionCode;
  label: string;
  flag: string;
  currency: "AUD" | "NZD" | "USD";
}

export const REGIONS: Record<RegionCode, Region> = {
  AU: { code: "AU", label: "Australia", flag: "🇦🇺", currency: "AUD" },
  NZ: { code: "NZ", label: "New Zealand", flag: "🇳🇿", currency: "NZD" },
  US: { code: "US", label: "United States", flag: "🇺🇸", currency: "USD" },
};

const RATE_PER_USD: Record<string, number> = { USD: 1, AUD: 1.52, NZD: 1.66 };

export function convertFromUsd(amountUsd: number, toCurrency: string): number {
  return amountUsd * (RATE_PER_USD[toCurrency] ?? 1);
}

interface RegionContextValue {
  region: RegionCode;
  setRegion: (r: RegionCode) => void;
}

const RegionContext = createContext<RegionContextValue>({ region: "US", setRegion: () => {} });
const STORAGE_KEY = "longevity-region";

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<RegionCode>("US");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as RegionCode | null;
      if (saved && REGIONS[saved]) setRegionState(saved);
    } catch {}
  }, []);

  const setRegion = useCallback((r: RegionCode) => {
    setRegionState(r);
    try {
      localStorage.setItem(STORAGE_KEY, r);
    } catch {}
  }, []);

  return <RegionContext.Provider value={{ region, setRegion }}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  return useContext(RegionContext);
}
