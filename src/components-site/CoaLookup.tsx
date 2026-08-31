"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const MOCK_DB: Record<string, { compound: string; purity: string; date: string; result: "PASS" | "FAIL" }> = {
  "NVR-24-1108-A": { compound: "Semaglutide", purity: "99.42%", date: "2024.11.08", result: "PASS" },
  "NVR-24-1102-C": { compound: "BPC-157", purity: "99.68%", date: "2024.11.02", result: "PASS" },
  "NVR-24-1029-B": { compound: "TB-500", purity: "99.51%", date: "2024.10.29", result: "PASS" },
  "NVR-24-1105-D": { compound: "GHK-Cu", purity: "99.74%", date: "2024.11.05", result: "PASS" },
  "NVR-24-1109-B": { compound: "Semaglutide", purity: "99.38%", date: "2024.11.09", result: "PASS" },
  "NVR-24-1101-A": { compound: "Tirzepatide", purity: "99.62%", date: "2024.11.01", result: "PASS" },
  "NVR-24-1030-C": { compound: "Retatrutide", purity: "99.44%", date: "2024.10.30", result: "PASS" },
};

type LookupState = "idle" | "loading" | "found" | "not-found";

export default function CoaLookup() {
  const [state, setState] = useState<LookupState>("idle");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<typeof MOCK_DB[string] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = query.trim().toUpperCase();
    if (!code) return;
    setState("loading");
    setTimeout(() => {
      const match = MOCK_DB[code];
      if (match) {
        setResult(match);
        setState("found");
      } else {
        setResult(null);
        setState("not-found");
      }
    }, 600);
  };

  return (
    <div className="lg:col-span-7">
      <div className="relative rounded-lg glass overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-background-200/60 bg-background-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-signal"></span>
            <span className="w-2 h-2 rounded-full bg-primary-500/60"></span>
            <span className="w-2 h-2 rounded-full bg-secondary-500"></span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.22em] text-foreground-500 uppercase">Vertalis Verification · Terminal</span>
          <span className="font-mono text-[10px] text-foreground-600">v2.4</span>
        </div>

        {/* Terminal body */}
        <div className="relative p-8 md:p-10 bg-background-900/50">
          <div className="mb-6 font-mono text-[11px] text-primary-500">
            <span className="mr-2">$</span>
            <span className="text-foreground-500">vertalis verify --batch</span>
          </div>

          <form className="relative" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setState("idle"); }}
                  placeholder="NVR-24-1108-A"
                  className="w-full h-14 px-5 rounded-md bg-background-800 border border-background-200 text-foreground-100 font-mono text-[15px] tracking-wider placeholder:text-foreground-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40 transition"
                  type="text"
                />
                {state === "idle" && (
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-2 h-4 bg-primary-500 animate-blink"></span>
                )}
              </div>
              <button
                type="submit"
                disabled={state === "loading"}
                className="h-14 px-7 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all whitespace-nowrap cursor-pointer disabled:opacity-70 flex items-center gap-2"
              >
                {state === "loading" ? (
                  <><i className="ri-loader-4-line text-[15px] animate-spin"></i>Scanning…</>
                ) : (
                  <><i className="ri-shield-check-line text-[15px]"></i>Verify Batch</>
                )}
              </button>
            </div>
          </form>

          {/* Result area */}
          {state === "found" && result && (
            <div className="mt-6 p-4 rounded-md border border-secondary-500/30 bg-secondary-500/5">
              <div className="flex items-center gap-2 mb-4">
                <i className="ri-checkbox-circle-fill text-secondary-500 text-[16px]"></i>
                <span className="font-mono text-[12px] text-secondary-500 font-semibold">BATCH VERIFIED · PASS</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px]">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.24em] text-foreground-600 uppercase mb-1">Batch</p>
                  <p className="font-mono text-foreground-200">{query.trim().toUpperCase()}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] tracking-[0.24em] text-foreground-600 uppercase mb-1">Compound</p>
                  <p className="text-foreground-200">{result.compound}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] tracking-[0.24em] text-foreground-600 uppercase mb-1">Purity</p>
                  <p className="font-mono text-primary-500">{result.purity}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] tracking-[0.24em] text-foreground-600 uppercase mb-1">Test Date</p>
                  <p className="font-mono text-foreground-200">{result.date}</p>
                </div>
              </div>
              <Link href={`/coa/${query.trim().toUpperCase()}`} className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-primary-500 hover:text-primary-400 transition-colors">
                Download full COA <i className="ri-download-line"></i>
              </Link>
            </div>
          )}

          {state === "not-found" && (
            <div className="mt-6 p-4 rounded-md border border-signal/30 bg-signal/5">
              <div className="flex items-center gap-2">
                <i className="ri-error-warning-line text-signal text-[16px]"></i>
                <span className="font-mono text-[12px] text-signal">BATCH NOT FOUND: try NVR-24-1108-A</span>
              </div>
            </div>
          )}

          {state === "idle" && (
            <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-background-200/60">
              <div>
                <p className="font-mono text-[9px] tracking-[0.24em] text-foreground-600 uppercase mb-1">Latest Batch</p>
                <p className="font-mono text-[12px] text-foreground-200">NVR-24-1108-A</p>
              </div>
              <div>
                <p className="font-mono text-[9px] tracking-[0.24em] text-foreground-600 uppercase mb-1">Tested</p>
                <p className="font-mono text-[12px] text-foreground-200">2024.11.08</p>
              </div>
              <div>
                <p className="font-mono text-[9px] tracking-[0.24em] text-foreground-600 uppercase mb-1">Result</p>
                <p className="font-mono text-[12px] text-secondary-500 flex items-center gap-1.5">
                  <i className="ri-checkbox-circle-fill"></i>Passed
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-2.5 border-t border-background-200/60 bg-background-900/40">
          <span className="font-mono text-[10px] text-foreground-600">2,847 batches archived</span>
          <Link href="/coa" className="font-mono text-[10px] text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1">
            BROWSE ARCHIVE<i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}
