"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProduct, getVariants, getVariantLabel, getRating } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import StarRating from "@/components/StarRating";
import CoaModal from "@/components/CoaModal";

function formatPrice(price: number) {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

export default function BestSellerCard({
  slug,
  batchLabel,
  category,
}: {
  slug: string;
  batchLabel: string;
  category: string;
}) {
  const base = getProduct(slug);
  if (!base) return null;

  const variants = getVariants(base.name);
  const [selectedSlug, setSelectedSlug] = useState(slug);
  const selected = variants.find((v) => v.slug === selectedSlug) ?? base;
  const { addItem } = useCart();
  const rating = getRating(base);
  const href = `/product/${selected.slug}`;
  const [showCoa, setShowCoa] = useState(false);

  // Derive a display batch code + test date from the MMDD-style batchLabel
  // (e.g. "1121-A" -> NVR-24-1121-A, tested 2024-11-21).
  const batchCode = `NVR-24-${batchLabel}`;
  const mm = batchLabel.slice(0, 2);
  const dd = batchLabel.slice(2, 4);
  const testDate = `2024-${mm}-${dd}`;
  const labRef = `JAN-2024-${mm}-${4700 + parseInt(dd, 10)}`;

  return (
    <article
      className="group relative rounded-xl overflow-hidden bg-background-900/70 border border-background-200/60 hover:border-primary-500/40 transition-all duration-500 ease-precision cursor-pointer"
      data-product-shop="true"
    >
      <Link href={href} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-background-100">
          <Image
            src={selected.image}
            alt={`${base.name} research peptide vial ${selected.spec}`}
            title={`${base.name} · ${selected.spec}`}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-precision"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="photo-fade absolute inset-0 bg-gradient-to-t from-background-900/90 via-background-900/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background-900/70 backdrop-blur border border-background-200/50">
            <span className={`w-1.5 h-1.5 rounded-full ${selected.statusDot}`}></span>
            <span className="font-mono text-[10px] tracking-wider text-foreground-300">
              {selected.statusLabel}
            </span>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background-900/70 backdrop-blur border border-primary-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 shadow-[0_0_7px_2px_rgb(var(--secondary-500) / 0.6)]"></span>
            <span className="font-mono text-[10px] tracking-wider text-primary-500">
              {selected.purity}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-block px-2 py-0.5 rounded-md bg-background-100 font-mono text-[10px] tracking-wider text-foreground-500 uppercase">
            {category}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowCoa(true);
            }}
            className="flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-background-100 border border-background-200/60 text-foreground-400 hover:bg-primary-500 hover:text-background-900 hover:border-primary-500 transition-all cursor-pointer"
            title="View COA"
          >
            <span className="font-mono text-[10px] tracking-wide">Read COA</span>
            <i className="ri-shield-check-line text-[13px]"></i>
          </button>
        </div>

        <Link href={href} className="block">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <h3 className="font-display text-[16px] leading-tight text-foreground-100 group-hover:text-primary-500 transition-colors duration-500">
              {base.name}
            </h3>
            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="font-display text-[16px] text-foreground-100 group-hover:text-foreground-100 transition-colors duration-500">
                {formatPrice(selected.price)}
              </span>
              <span className="font-mono text-[10px] text-foreground-600">USD</span>
            </div>
          </div>
          <div className="mb-2">
            <StarRating stars={rating.stars} count={rating.count} />
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <i className="ri-shield-check-line text-[12px] text-secondary-500"></i>
            <span className="font-mono text-[11px] tracking-wide text-secondary-500">
              99%+ Purity Verified
            </span>
          </div>
          <div className="flex items-center gap-1.5 mb-4">
            <i className="ri-truck-line text-[12px] text-foreground-500"></i>
            <span className="font-mono text-[10px] tracking-wide text-foreground-500">
              Ships within 24h
            </span>
          </div>
        </Link>

        {variants.length > 1 ? (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {variants.map((v) => (
              <button
                key={v.slug}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedSlug(v.slug);
                }}
                className={`px-2.5 py-1 rounded-md font-mono text-[10px] tracking-wide border transition-all duration-300 ease-precision cursor-pointer ${
                  v.slug === selected.slug
                    ? "bg-primary-500 text-background-900 border-primary-500"
                    : "bg-background-100 text-foreground-400 border-background-200/60 hover:border-primary-500/50 hover:text-primary-500"
                }`}
              >
                {getVariantLabel(v)}
              </button>
            ))}
          </div>
        ) : (
          <p className="font-mono text-[11px] text-foreground-500 mb-4">{selected.spec}</p>
        )}

        <div className="flex items-center justify-between pt-4 mb-4 border-t border-background-200/60">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] tracking-[0.2em] text-foreground-600 uppercase">Dose</span>
            <span className="text-[12px] text-foreground-200">{selected.spec}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="font-mono text-[9px] tracking-[0.2em] text-foreground-600 uppercase">Batch</span>
            <span className="font-mono text-[11px] text-primary-500">{batchLabel}</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            addItem({
              slug: selected.slug,
              name: base.name,
              spec: selected.spec,
              price: selected.price,
              image: selected.image,
            });
          }}
          className="w-full h-10 rounded-lg text-[12px] font-medium transition-all duration-500 ease-precision flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer bg-background-100 text-foreground-300 hover:bg-primary-500 hover:text-background-900 hover:shadow-[0_0_20px_-4px_rgb(var(--primary-500) / 0.4)]"
        >
          <i className="ri-shopping-bag-3-line text-[13px]"></i>Quick Add
        </button>
      </div>

      {showCoa && (
        <CoaModal
          coa={{
            batchCode,
            compound: base.name,
            spec: selected.spec,
            purity: selected.purity,
            testDate,
            labRef,
          }}
          onClose={() => setShowCoa(false)}
        />
      )}
    </article>
  );
}
