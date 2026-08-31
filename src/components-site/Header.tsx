"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { getProduct } from "@/data/products";
import ThemeToggle from "@/components/ThemeToggle";
import SearchModal from "@/components/SearchModal";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop Peptides" },
  { href: "/about", label: "About Us" },
  { href: "/affiliate", label: "Lab Affiliate Program" },
  { href: "/coa", label: "COAs" },
  { href: "/contact", label: "Contact Us" },
];

const CONTACT_DROPDOWN = [
  { slug: "blog", href: "/blog", name: "Blog", desc: "Research notes & methodology.", icon: "ri-article-line" },
  { slug: "veterans", href: "/veterans", name: "Vets & First Responders", desc: "23% off for life. How we honor service.", icon: "ri-medal-line" },
  { slug: "faq", href: "/faq", name: "FAQ", desc: "Answers before and after ordering.", icon: "ri-question-line" },
  { slug: "contact", href: "/contact", name: "Contact Us", desc: "Talk to a person, 7 days a week.", icon: "ri-mail-line" },
];

/** Mega-menu: research "protocol" groupings, each pointing at real catalog products. */
const SHOP_PROTOCOLS = [
  {
    slug: "recovery",
    label: "Recovery & Repair",
    href: "/shop/recovery-repair",
    icon: "ri-heart-pulse-line",
    productSlugs: ["nvr-bpc-5", "nvr-tb500-5", "nvr-kpv-10", "nvr-wolverine-20"],
  },
  {
    slug: "longevity",
    label: "Longevity & Cellular Health",
    href: "/shop/longevity",
    icon: "ri-infinity-line",
    productSlugs: ["nvr-nad-500", "nvr-ta1-5", "nvr-epitalon-10", "nvr-ghk-50"],
  },
  {
    slug: "metabolic",
    label: "Metabolic & Weight",
    href: "/shop/fat-loss-metabolic",
    icon: "ri-fire-line",
    productSlugs: ["nvr-sema-10", "nvr-tirz-10", "nvr-reta-10", "nvr-motsc-10"],
  },
  {
    slug: "growth",
    label: "Growth & Performance",
    href: "/shop",
    icon: "ri-rocket-2-line",
    productSlugs: ["nvr-tesa-10", "nvr-cjc-2", "nvr-blend-cjcipa-10", "nvr-igf1lr3-1"],
  },
  {
    slug: "cognition",
    label: "Cognition & Mood",
    href: "/shop/cognitive",
    icon: "ri-brain-line",
    productSlugs: ["nvr-semax-10", "nvr-selank-10"],
  },
  {
    slug: "vitality",
    label: "Vitality",
    href: "/shop",
    icon: "ri-sparkling-2-line",
    productSlugs: ["nvr-pt141-10", "nvr-mt2-10", "nvr-oxytocin-10"],
  },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const [mobileContactOpen, setMobileContactOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contactCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { count, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openShopMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShopMenuOpen(true);
  };
  const scheduleCloseShopMenu = () => {
    closeTimer.current = setTimeout(() => setShopMenuOpen(false), 150);
  };

  const openContactMenu = () => {
    if (contactCloseTimer.current) clearTimeout(contactCloseTimer.current);
    setContactMenuOpen(true);
  };
  const scheduleCloseContactMenu = () => {
    contactCloseTimer.current = setTimeout(() => setContactMenuOpen(false), 150);
  };

  return (
    <header
      className={`fixed top-10 left-0 right-0 z-50 transition-all duration-500 ease-precision ${
        scrolled
          ? "bg-background-800/85 backdrop-blur-xl border-b border-background-200/60"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="w-full px-6 md:px-10 h-[72px] flex items-center justify-between">
        <Link className="group flex items-center gap-3 cursor-pointer" href="/">
          <span className="relative w-9 h-9 flex items-center justify-center shrink-0">
            <span className="absolute inset-0 rounded-lg border border-primary-500/50 rotate-45 group-hover:border-primary-500 group-hover:shadow-[0_0_18px_-2px_rgb(var(--primary-500) / 0.7)] transition-all duration-500 ease-precision"></span>
            <span className="absolute inset-[7px] rounded-md bg-primary-500/10 rotate-45 group-hover:bg-primary-500/20 transition-colors duration-500 ease-precision"></span>
            <span className="relative w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_12px_3px_rgb(var(--primary-500) / 0.65)]"></span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[20px] md:text-[22px] tracking-[0.22em] text-foreground-100 group-hover:text-primary-500 transition-colors duration-300">
              VERTALIS
            </span>
            <span className="font-mono text-[8px] md:text-[9px] tracking-[0.42em] text-foreground-500 uppercase mt-1">
              Laboratories
            </span>
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-10">
          {NAV_LINKS.map((link) =>
            link.href === "/shop" ? (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={openShopMenu}
                onMouseLeave={scheduleCloseShopMenu}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-1.5 text-[14.5px] tracking-wide text-foreground-300 hover:text-foreground-100 transition-colors relative group"
                  aria-expanded={shopMenuOpen}
                >
                  {link.label}
                  <i
                    className={`ri-arrow-down-s-line text-[14px] transition-transform duration-300 ease-precision ${
                      shopMenuOpen ? "rotate-180 text-primary-500" : ""
                    }`}
                  ></i>
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-primary-500 transition-all duration-500 ease-precision group-hover:w-full"></span>
                </Link>

                {/* Mega menu */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-[calc(100%+18px)] w-[940px] max-w-[92vw] rounded-lg bg-background-800/95 backdrop-blur-xl border border-background-200/60 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.6)] transition-all duration-300 ease-precision ${
                    shopMenuOpen
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-background-200/50">
                    <span className="font-mono text-[10px] tracking-[0.24em] text-primary-500 uppercase">
                      Shop by Research Protocol
                    </span>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground-200 hover:text-primary-500 transition-colors"
                    >
                      All Products
                      <i className="ri-arrow-right-line text-[13px]"></i>
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-7 p-7">
                    {SHOP_PROTOCOLS.map((proto) => (
                      <div key={proto.slug}>
                        <Link href={proto.href} className="group/proto flex items-center gap-2 mb-3">
                          <span className="w-7 h-7 flex items-center justify-center rounded-md bg-primary-500/10 text-primary-500 shrink-0 group-hover/proto:bg-primary-500 group-hover/proto:text-background-900 transition-all duration-300 ease-precision">
                            <i className={`${proto.icon} text-[13px]`}></i>
                          </span>
                          <span className="text-[12px] font-semibold text-foreground-100 group-hover/proto:text-primary-500 transition-colors uppercase tracking-wide">
                            {proto.label}
                          </span>
                        </Link>
                        <div className="flex flex-col gap-0.5 pl-9">
                          {proto.productSlugs.map((slug) => {
                            const product = getProduct(slug);
                            if (!product) return null;
                            return (
                              <Link
                                key={slug}
                                href={`/product/${slug}`}
                                className="group/item flex items-center gap-2.5 py-1.5 text-[12.5px] text-foreground-400 hover:text-primary-500 transition-colors"
                              >
                                <span className="w-6 h-6 rounded overflow-hidden bg-background-200 shrink-0">
                                  <img src={product.image} alt="" className="w-full h-full object-cover object-top" />
                                </span>
                                <span className="truncate">{product.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className="flex items-center justify-between px-7 py-4 border-t border-background-200/50"
                    style={{ background: "rgb(var(--primary-500) / 0.03)" }}
                  >
                    <span className="flex items-center gap-2 text-[11px] text-foreground-500">
                      <i className="ri-shield-check-line text-[13px] text-primary-500"></i>
                      Every listing is HPLC-verified and COA-backed.
                    </span>
                    <div className="flex items-center gap-4">
                      <Link
                        href="/quiz"
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary-500 hover:text-primary-400 transition-colors"
                      >
                        Take the Quiz
                        <i className="ri-arrow-right-line text-[13px]"></i>
                      </Link>
                      <Link
                        href="/shop"
                        className="inline-flex items-center h-8 px-4 rounded-md bg-primary-500 text-background-900 text-[11px] font-semibold hover:bg-primary-400 transition-all duration-300 ease-precision whitespace-nowrap"
                      >
                        Shop All
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : link.href === "/contact" ? (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={openContactMenu}
                onMouseLeave={scheduleCloseContactMenu}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-1.5 text-[14.5px] tracking-wide text-foreground-300 hover:text-foreground-100 transition-colors relative group"
                  aria-expanded={contactMenuOpen}
                >
                  {link.label}
                  <i
                    className={`ri-arrow-down-s-line text-[14px] transition-transform duration-300 ease-precision ${
                      contactMenuOpen ? "rotate-180 text-primary-500" : ""
                    }`}
                  ></i>
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-primary-500 transition-all duration-500 ease-precision group-hover:w-full"></span>
                </Link>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 top-[calc(100%+18px)] w-[300px] rounded-lg bg-background-800/95 backdrop-blur-xl border border-background-200/60 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.6)] transition-all duration-300 ease-precision overflow-hidden ${
                    contactMenuOpen
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  {CONTACT_DROPDOWN.map((item) => (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className="group/item flex items-start gap-3 px-4 py-3.5 hover:bg-background-100/70 transition-colors duration-300 ease-precision border-b border-background-200/40 last:border-none"
                    >
                      <span className="w-8 h-8 flex items-center justify-center rounded-md bg-primary-500/10 text-primary-500 shrink-0 group-hover/item:bg-primary-500 group-hover/item:text-background-900 transition-all duration-300 ease-precision">
                        <i className={`${item.icon} text-[14px]`}></i>
                      </span>
                      <span className="flex flex-col">
                        <span className="text-[13px] font-medium text-foreground-100 group-hover/item:text-primary-500 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-foreground-500 leading-snug mt-0.5">
                          {item.desc}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14.5px] tracking-wide text-foreground-300 hover:text-foreground-100 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-primary-500 transition-all duration-500 ease-precision group-hover:w-full"></span>
              </Link>
            )
          )}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="hidden md:flex w-9 h-9 items-center justify-center rounded-md text-foreground-300 hover:text-primary-500 hover:bg-background-200/60 transition-colors cursor-pointer"
          >
            <i className="ri-search-line text-[17px]"></i>
          </button>
          <Link
            href="/account"
            className="hidden md:flex w-9 h-9 items-center justify-center rounded-md text-foreground-300 hover:text-primary-500 hover:bg-background-200/60 transition-colors cursor-pointer"
          >
            <i className="ri-user-line text-[17px]"></i>
          </Link>
          <button
            onClick={openCart}
            className="relative flex w-9 h-9 items-center justify-center rounded-md text-foreground-100 hover:text-primary-500 hover:bg-background-200/60 transition-colors cursor-pointer"
            aria-label="Open cart"
          >
            <i className="ri-shopping-bag-3-line text-[17px]"></i>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-primary-500 text-background-900 font-mono text-[9px] font-semibold">
                {count}
              </span>
            )}
          </button>
          <Link
            href="/shop"
            className="hidden md:inline-flex ml-2 h-9 items-center px-4 rounded-md bg-primary-500 text-background-900 text-[12px] font-semibold tracking-wide hover:bg-primary-400 transition-all duration-300 ease-precision hover:shadow-[0_0_24px_-4px_rgb(var(--primary-500) / 0.6)] whitespace-nowrap cursor-pointer"
          >
            Shop Peptides
          </Link>
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-md text-foreground-300 hover:text-primary-500 hover:bg-background-200/60 transition-colors cursor-pointer"
          >
            <i className="ri-search-line text-[17px]"></i>
          </button>
          <button
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-md text-foreground-100 hover:bg-background-200/60 cursor-pointer"
          >
            <i className={`${menuOpen ? "ri-close-line" : "ri-menu-line"} text-[19px]`}></i>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="lg:hidden bg-background-800/95 backdrop-blur-xl border-b border-background-200/60">
          <nav className="flex flex-col px-6 py-4">
            {NAV_LINKS.map((link) =>
              link.href === "/shop" ? (
                <div key={link.href} className="border-b border-background-200/40">
                  <div className="flex items-center justify-between py-3">
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-[14.5px] tracking-wide text-foreground-300 hover:text-foreground-100 transition-colors"
                    >
                      {link.label}
                    </Link>
                    <button
                      aria-label="Toggle categories"
                      onClick={() => setMobileShopOpen((v) => !v)}
                      className="w-8 h-8 flex items-center justify-center text-foreground-400 cursor-pointer"
                    >
                      <i
                        className={`ri-arrow-down-s-line text-[16px] transition-transform duration-300 ease-precision ${
                          mobileShopOpen ? "rotate-180 text-primary-500" : ""
                        }`}
                      ></i>
                    </button>
                  </div>
                  {mobileShopOpen && (
                    <div className="pb-4 flex flex-col gap-4">
                      {SHOP_PROTOCOLS.map((proto) => (
                        <div key={proto.slug}>
                          <Link
                            href={proto.href}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 pl-2 text-[12px] font-semibold text-foreground-300 hover:text-primary-500 transition-colors uppercase tracking-wide"
                          >
                            <i className={`${proto.icon} text-[13px]`}></i>
                            {proto.label}
                          </Link>
                          <div className="mt-1.5 flex flex-col gap-0.5 pl-8">
                            {proto.productSlugs.map((slug) => {
                              const product = getProduct(slug);
                              if (!product) return null;
                              return (
                                <Link
                                  key={slug}
                                  href={`/product/${slug}`}
                                  onClick={() => setMenuOpen(false)}
                                  className="py-1.5 text-[12px] text-foreground-500 hover:text-primary-500 transition-colors"
                                >
                                  {product.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center gap-4 pl-2 pt-1">
                        <Link
                          href="/quiz"
                          onClick={() => setMenuOpen(false)}
                          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary-500"
                        >
                          Take the Quiz <i className="ri-arrow-right-line text-[13px]"></i>
                        </Link>
                        <Link
                          href="/shop"
                          onClick={() => setMenuOpen(false)}
                          className="inline-flex items-center h-8 px-4 rounded-md bg-primary-500 text-background-900 text-[11px] font-semibold whitespace-nowrap"
                        >
                          Shop All
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : link.href === "/contact" ? (
                <div key={link.href} className="border-b border-background-200/40">
                  <div className="flex items-center justify-between py-3">
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-[14.5px] tracking-wide text-foreground-300 hover:text-foreground-100 transition-colors"
                    >
                      {link.label}
                    </Link>
                    <button
                      aria-label="Toggle contact links"
                      onClick={() => setMobileContactOpen((v) => !v)}
                      className="w-8 h-8 flex items-center justify-center text-foreground-400 cursor-pointer"
                    >
                      <i
                        className={`ri-arrow-down-s-line text-[16px] transition-transform duration-300 ease-precision ${
                          mobileContactOpen ? "rotate-180 text-primary-500" : ""
                        }`}
                      ></i>
                    </button>
                  </div>
                  {mobileContactOpen && (
                    <div className="pb-3 grid grid-cols-1 gap-0.5">
                      {CONTACT_DROPDOWN.map((item) => (
                        <Link
                          key={item.slug}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 py-2 pl-2 text-[12px] text-foreground-400 hover:text-primary-500 transition-colors"
                        >
                          <i className={`${item.icon} text-[13px]`}></i>
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-[14.5px] tracking-wide text-foreground-300 hover:text-foreground-100 transition-colors border-b border-background-200/40 last:border-none"
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="flex items-center justify-between py-3 border-t border-background-200/40 mt-1">
              <span className="text-[14.5px] tracking-wide text-foreground-300">Theme</span>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
