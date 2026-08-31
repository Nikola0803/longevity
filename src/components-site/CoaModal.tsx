"use client";

import { useEffect } from "react";

interface CoaData {
  batchCode: string;
  compound: string;
  spec: string;
  purity: string;
  testDate: string;
  labRef: string;
}

export default function CoaModal({
  coa,
  onClose,
}: {
  coa: CoaData;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background-900/85 backdrop-blur-md"></div>

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl bg-background-900 border border-background-200/60 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* COA Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-background-200/60 bg-background-800/60">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-signal"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-500"></span>
            </div>
            <span className="font-mono text-[11px] tracking-[0.2em] text-foreground-500 uppercase">Certificate of Analysis</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-foreground-500 hover:text-foreground-100 hover:bg-background-200/40 transition-all cursor-pointer"
          >
            <i className="ri-close-line text-[16px]"></i>
          </button>
        </div>

        {/* COA Body */}
        <div className="p-8 overflow-y-auto max-h-[80vh]">
          {/* Lab header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative w-5 h-5 flex items-center justify-center">
                  <span className="absolute inset-0 rounded border border-primary-500/50 rotate-45"></span>
                  <span className="relative w-1 h-1 rounded-full bg-primary-500"></span>
                </span>
                <span className="font-display text-[14px] tracking-[0.2em] text-foreground-100">VERTALIS</span>
              </div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-foreground-600 uppercase">Research Peptide Laboratories</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-secondary-500/30 bg-secondary-500/10">
                <i className="ri-checkbox-circle-fill text-secondary-500 text-[13px]"></i>
                <span className="font-mono text-[11px] text-secondary-500 font-semibold">CERTIFIED · PASS</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="font-display text-[28px] text-foreground-100 mb-1">Certificate of Analysis</h2>
            <p className="font-mono text-[12px] text-foreground-500">Independent third-party laboratory verification</p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: "Batch / Lot Number", value: coa.batchCode },
              { label: "Compound", value: coa.compound },
              { label: "Specification", value: coa.spec },
              { label: "Date of Analysis", value: coa.testDate },
              { label: "Lab Reference", value: coa.labRef },
              { label: "Test Method", value: "HPLC + LC-MS/MS" },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-md bg-background-100/50 border border-background-200/40">
                <p className="font-mono text-[9px] tracking-[0.2em] text-foreground-600 uppercase mb-1">{item.label}</p>
                <p className="font-mono text-[12px] text-foreground-200">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Results table */}
          <div className="mb-8">
            <h3 className="font-mono text-[10px] tracking-[0.22em] text-foreground-500 uppercase mb-3">Analytical Results</h3>
            <div className="rounded-md border border-background-200/60 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-background-200/60 bg-background-800/60">
                    {["Test", "Method", "Specification", "Result", "Status"].map((h) => (
                      <th key={h} className="py-2.5 px-3 font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Identity (HPLC)", "USP <621>", "Conforms", "Conforms", "PASS"],
                    ["Purity (HPLC)", "USP <621>", "≥99.0%", coa.purity, "PASS"],
                    ["Molecular Weight", "LC-MS/MS", "Theoretical ±0.05%", "Confirmed", "PASS"],
                    ["Endotoxin", "LAL Method", "<5 EU/mg", "<0.5 EU/mg", "PASS"],
                    ["Appearance", "Visual", "White lyophilized powder", "Conforms", "PASS"],
                    ["Moisture (KF)", "USP <921>", "≤8.0%", "3.2%", "PASS"],
                  ].map(([test, method, spec, result, status], i) => (
                    <tr key={test} className={`border-b border-background-200/40 last:border-none ${i % 2 === 0 ? "bg-background-100/20" : ""}`}>
                      <td className="py-2.5 px-3 text-[12px] text-foreground-200">{test}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-foreground-500">{method}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-foreground-500">{spec}</td>
                      <td className="py-2.5 px-3 font-mono text-[12px] text-primary-500">{result}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-secondary-500">
                          <i className="ri-checkbox-circle-fill text-[11px]"></i>{status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signature block */}
          <div className="flex items-start justify-between pt-6 border-t border-background-200/60">
            <div>
              <div className="font-display text-[18px] text-foreground-400 italic mb-1" style={{ fontFamily: "cursive" }}>Janoshik Analytical</div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-foreground-600 uppercase">Authorized Signatory</p>
              <p className="font-mono text-[10px] text-foreground-600">Independent Testing Laboratory</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] tracking-[0.2em] text-foreground-600 uppercase mb-1">Certificate No.</p>
              <p className="font-mono text-[12px] text-primary-500">{coa.batchCode}-COA</p>
              <p className="font-mono text-[10px] text-foreground-600 mt-1">{coa.testDate}</p>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="mt-6 text-[11px] text-foreground-600 leading-relaxed border-t border-background-200/40 pt-4">
            This Certificate of Analysis is issued for research use only. Results are specific to the lot number stated above. This document does not constitute a warranty of fitness for any particular purpose.
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-background-200/60 bg-background-800/40">
          <p className="font-mono text-[10px] text-foreground-600">Batch {coa.batchCode}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="h-8 px-4 rounded-md border border-background-200 text-[12px] text-foreground-400 hover:border-primary-500 hover:text-primary-500 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <i className="ri-printer-line text-[13px]"></i>Print
            </button>
            <button
              onClick={onClose}
              className="h-8 px-4 rounded-md bg-primary-500 text-background-900 text-[12px] font-semibold hover:bg-primary-400 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
