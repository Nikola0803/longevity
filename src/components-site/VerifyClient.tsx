"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import CoaModal from "@/components/CoaModal";
import { getProduct } from "@/data/products";
import { getLatestCoaForProduct } from "@/data/coa-records";

export default function VerifyClient({ slug }: { slug: string }) {
  const [showCoa, setShowCoa] = useState(false);
  const product = getProduct(slug);
  const coa = product ? getLatestCoaForProduct(product.name) : undefined;

  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner /><Header />
      <main>
        <section className="relative pt-[112px] pb-16 md:pb-24 bg-background-900 border-b border-background-200/60 overflow-hidden">
          <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none"></div>
          <div className="absolute top-24 right-10 w-80 h-80 rounded-full bg-primary-500/5 blur-[120px] pointer-events-none"></div>

          <div className="relative w-full max-w-lg mx-auto px-6 pt-10 md:pt-14">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-8 h-px bg-primary-500/60"></span>
              <span className="font-mono text-[10px] tracking-[0.28em] text-primary-500 uppercase">Batch Verification</span>
              <span className="w-8 h-px bg-primary-500/60"></span>
            </div>

            {!product ? (
              <div className="text-center rounded-2xl border border-background-200/60 bg-background-100/40 p-8">
                <i className="ri-error-warning-line text-[32px] text-yellow-400 mb-4 block"></i>
                <h1 className="font-display text-[22px] text-foreground-100 mb-2">Compound not recognized</h1>
                <p className="text-[13px] text-foreground-500 leading-relaxed mb-6">
                  This QR code doesn&#39;t match a product in our current catalog. If you scanned this from a Vertalis vial label, contact us with the batch code printed on it and we&#39;ll verify it directly.
                </p>
                <Link href="/contact" className="inline-flex items-center gap-2 h-11 px-6 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer">
                  Contact Support<i className="ri-arrow-right-line text-[14px]"></i>
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-background-200/60 bg-background-100/40 overflow-hidden">
                <div className="flex items-center gap-4 p-6 border-b border-background-200/50">
                  <div className="relative w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-background-100 border border-background-200/60">
                    <Image src={product.image} alt={product.imgAlt} fill className="object-cover object-top" sizes="64px" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-primary-500 uppercase mb-1">{product.category}</p>
                    <h1 className="font-display text-[20px] text-foreground-100 leading-tight truncate">{product.name}</h1>
                    <p className="font-mono text-[12px] text-foreground-500 mt-0.5">{product.spec}</p>
                  </div>
                </div>

                {coa ? (
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-secondary-500/30 bg-secondary-500/10">
                        <i className="ri-checkbox-circle-fill text-secondary-500 text-[13px]"></i>
                        <span className="font-mono text-[11px] text-secondary-500 font-semibold">CERTIFIED · PASS</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="p-3 rounded-md bg-background-100/60 border border-background-200/40">
                        <p className="font-mono text-[9px] tracking-[0.15em] text-foreground-600 uppercase mb-1">Batch / Lot</p>
                        <p className="font-mono text-[13px] text-foreground-100">{coa.batchCode}</p>
                      </div>
                      <div className="p-3 rounded-md bg-background-100/60 border border-background-200/40">
                        <p className="font-mono text-[9px] tracking-[0.15em] text-foreground-600 uppercase mb-1">Purity (HPLC)</p>
                        <p className="font-mono text-[13px] text-primary-500">{coa.purity}</p>
                      </div>
                      <div className="p-3 rounded-md bg-background-100/60 border border-background-200/40">
                        <p className="font-mono text-[9px] tracking-[0.15em] text-foreground-600 uppercase mb-1">Date of Analysis</p>
                        <p className="font-mono text-[13px] text-foreground-200">{coa.testDate}</p>
                      </div>
                      <div className="p-3 rounded-md bg-background-100/60 border border-background-200/40">
                        <p className="font-mono text-[9px] tracking-[0.15em] text-foreground-600 uppercase mb-1">Lab Reference</p>
                        <p className="font-mono text-[13px] text-foreground-200">{coa.labRef}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-foreground-500 leading-relaxed mb-6">
                      This is the most recently released, independently tested batch of {product.name} we have on file. Every dose size of this compound ships from the same tested lot until a newer batch clears analysis.
                    </p>

                    <button
                      onClick={() => setShowCoa(true)}
                      className="w-full h-12 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all duration-300 ease-precision flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="ri-shield-check-line text-[15px]"></i>View Full Certificate
                    </button>
                    <Link
                      href={`/product/${product.slug}`}
                      className="mt-3 w-full h-11 rounded-md border border-background-200 text-[13px] text-foreground-300 hover:border-primary-500 hover:text-primary-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      View Product Page<i className="ri-arrow-right-line text-[13px]"></i>
                    </Link>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <i className="ri-time-line text-[28px] text-yellow-400 mb-3 block"></i>
                    <p className="text-[13px] text-foreground-300 font-medium mb-1">Certificate being finalized</p>
                    <p className="text-[12px] text-foreground-500 leading-relaxed mb-6">
                      We don&#39;t have a published COA on file for {product.name} yet. If you have a vial in hand, message us the batch code on the label and we&#39;ll send the certificate directly.
                    </p>
                    <Link href="/contact" className="inline-flex items-center gap-2 h-11 px-6 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all cursor-pointer">
                      Contact Support<i className="ri-arrow-right-line text-[14px]"></i>
                    </Link>
                  </div>
                )}
              </div>
            )}

            <p className="mt-6 text-center text-[11px] text-foreground-600 leading-relaxed">
              Scanned from a Vertalis vial label. <Link href="/coa" className="text-primary-500 hover:text-primary-400 transition-colors">Browse the full COA archive →</Link>
            </p>
          </div>
        </section>
      </main>

      {showCoa && coa && (
        <CoaModal
          coa={{
            batchCode: coa.batchCode,
            compound: coa.product,
            spec: product?.spec ?? coa.category,
            purity: coa.purity,
            testDate: coa.testDate,
            labRef: coa.labRef,
          }}
          onClose={() => setShowCoa(false)}
        />
      )}
    </div>
  );
}
