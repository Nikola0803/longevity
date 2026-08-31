"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, getVariants, getVariantLabel, getRating } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import StarRating from "@/components/StarRating";

function formatPrice(price: number) {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const variants = getVariants(product.name);
  const [selectedSlug, setSelectedSlug] = useState(product.slug);
  const selected = variants.find((v) => v.slug === selectedSlug) ?? product;
  const href = `/product/${selected.slug}`;
  const rating = getRating(product);

  return (
    <article
      className="group relative rounded-xl overflow-hidden bg-background-900/70 border border-background-200/60 hover:border-primary-500/40 transition-all duration-500 ease-precision cursor-pointer"
      data-product-shop="true"
    >
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
        <span className="inline-block px-2 py-0.5 mb-2 rounded-md bg-background-100 font-mono text-[10px] tracking-wider text-foreground-500 uppercase">
          {product.category}
        </span>
        <Link href={href} className="block">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <h3 className="font-display text-[16px] leading-tight text-foreground-100 group-hover:text-primary-500 transition-colors duration-500">
              {product.name}
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
        {variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {variants.map((v) => (
              <button
                key={v.slug}
                type="button"
                onClick={() => setSelectedSlug(v.slug)}
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
        )}
        <button
          disabled={selected.disabled}
          onClick={() =>
            addItem({
              slug: selected.slug,
              name: product.name,
              spec: selected.spec,
              price: selected.price,
              image: selected.image,
            })
          }
          className="w-full h-10 rounded-lg text-[12px] font-medium transition-all duration-500 ease-precision flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer bg-background-100 text-foreground-300 hover:bg-primary-500 hover:text-background-900 hover:shadow-[0_0_20px_-4px_rgb(var(--primary-500) / 0.4)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-background-100 disabled:hover:text-foreground-300 disabled:hover:shadow-none"
        >
          <i className="ri-shopping-bag-3-line text-[13px]"></i>
          {selected.buttonText}
        </button>
        {selected.footText && (
          <p className={selected.footClass ?? ""}>{selected.footText}</p>
        )}
      </div>
    </article>
  );
}
