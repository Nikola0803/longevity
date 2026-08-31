"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/product-types";
import { getVariants, getVariantLabel, getRating, defaultPacks } from "@/lib/product-types";
import { useCart } from "@/lib/cart-context";
import StarRating from "./StarRating";

function formatPrice(price: number) {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

export default function ProductCard({ product, allProducts }: { product: Product; allProducts: Product[] }) {
  const { addItem } = useCart();
  const variants = getVariants(allProducts, product.name);
  const [selectedSlug, setSelectedSlug] = useState(product.slug);
  const selected = variants.find((v) => v.slug === selectedSlug) ?? product;
  const packs = selected.packs ?? defaultPacks(selected.price);
  const [packQty, setPackQty] = useState(packs[0]?.qty ?? 1);
  const activePack = packs.find((p) => p.qty === packQty) ?? packs[0];
  const href = `/product/${selected.slug}`;
  const rating = getRating(product);

  return (
    <article className="group relative rounded-xl overflow-hidden bg-background-900/70 border border-background-200/60 hover:border-primary-500/40 transition-all duration-500 ease-precision">
      <Link href={href} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-background-100">
          <Image
            src={selected.image}
            alt={selected.imgAlt}
            title={selected.imgTitle}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-precision"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background-900/70 backdrop-blur border border-background-200/50">
            <span className={`w-1.5 h-1.5 rounded-full ${selected.statusDot}`}></span>
            <span className="font-mono text-[10px] tracking-wider text-foreground-300">{selected.statusLabel}</span>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <span className="inline-block px-2 py-0.5 mb-2 rounded-md bg-background-100 font-mono text-[10px] tracking-wider text-foreground-500 uppercase">
          {product.category}
        </span>
        <Link href={href} className="block">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <h3 className="font-display text-[16px] leading-tight text-foreground-100 group-hover:text-primary-500 transition-colors duration-500">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="font-display text-[16px] text-foreground-100">{formatPrice(activePack?.price ?? selected.price)}</span>
              <span className="font-mono text-[10px] text-foreground-600">USD</span>
            </div>
          </div>
          <div className="mb-2">
            <StarRating stars={rating.stars} count={rating.count} />
          </div>
        </Link>

        {variants.length > 1 && (
          <div className="mb-2">
            <span className="font-mono text-[9px] tracking-wider text-foreground-600 uppercase block mb-1">Dose</span>
            <div className="flex flex-wrap gap-1.5">
              {variants.map((v) => (
                <button
                  key={v.slug}
                  type="button"
                  onClick={() => setSelectedSlug(v.slug)}
                  className={`px-2.5 py-1 rounded-md font-mono text-[10px] tracking-wide border transition-all duration-300 ease-precision ${
                    v.slug === selected.slug
                      ? "bg-primary-500 text-background-800 border-primary-500"
                      : "bg-background-100 text-foreground-400 border-background-200/60 hover:border-primary-500/50 hover:text-primary-500"
                  }`}
                >
                  {getVariantLabel(v)}
                </button>
              ))}
            </div>
          </div>
        )}

        {packs.length > 1 && (
          <div className="mb-4">
            <span className="font-mono text-[9px] tracking-wider text-foreground-600 uppercase block mb-1">Pack</span>
            <div className="flex flex-wrap gap-1.5">
              {packs.map((p) => (
                <button
                  key={p.qty}
                  type="button"
                  onClick={() => setPackQty(p.qty)}
                  className={`px-2.5 py-1 rounded-md font-mono text-[10px] tracking-wide border transition-all duration-300 ease-precision ${
                    p.qty === packQty
                      ? "bg-primary-500 text-background-800 border-primary-500"
                      : "bg-background-100 text-foreground-400 border-background-200/60 hover:border-primary-500/50 hover:text-primary-500"
                  }`}
                >
                  {p.qty}x
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          disabled={selected.disabled}
          onClick={() =>
            addItem({
              slug: selected.slug,
              name: product.name,
              spec: selected.spec,
              packQty,
              price: activePack?.price ?? selected.price,
              image: selected.image,
            })
          }
          className="w-full h-10 rounded-lg text-[12px] font-medium transition-all duration-500 ease-precision flex items-center justify-center gap-2 whitespace-nowrap bg-background-100 text-foreground-300 hover:bg-primary-500 hover:text-background-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <i className="ri-shopping-bag-3-line text-[13px]"></i>
          {selected.buttonText}
        </button>
      </div>
    </article>
  );
}
