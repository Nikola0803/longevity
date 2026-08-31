"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { PRODUCTS } from "@/data/products";

const BAC_SLUGS = ["nvr-bac-5", "nvr-bac-10"];

export default function CartDrawer() {
  const { items, isOpen, closeCart, addItem, removeItem, setQty, subtotal, count } = useCart();
  const router = useRouter();

  if (!isOpen) return null;

  const hasPeptide = items.some((i) => !BAC_SLUGS.includes(i.slug));
  const hasBac = items.some((i) => BAC_SLUGS.includes(i.slug));
  const bacOptions = PRODUCTS.filter((p) => BAC_SLUGS.includes(p.slug));

  const goCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={closeCart}
      ></div>
      <aside className="fixed top-0 right-0 z-[70] h-full w-full max-w-[420px] bg-background-900 border-l border-background-200/60 flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-background-200/60">
          <div className="flex items-center gap-2.5">
            <i className="ri-shopping-bag-3-line text-[18px] text-foreground-100"></i>
            <span className="font-display text-[15px] tracking-wide text-foreground-100">Cart</span>
            {count > 0 && (
              <span className="font-mono text-[11px] text-foreground-500">({count})</span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-10 h-10 flex items-center justify-center rounded-md text-foreground-400 hover:text-foreground-100 hover:bg-background-200/60 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <i className="ri-close-line text-[18px]"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-background-100 border border-background-200/60 mb-5">
                <i className="ri-shopping-bag-3-line text-[24px] text-foreground-500"></i>
              </div>
              <p className="text-[14px] text-foreground-400 mb-2">Your cart is empty</p>
              <p className="text-[12px] text-foreground-600 text-center max-w-xs mb-6">
                Browse the catalog to add research compounds to your order.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  router.push("/shop");
                }}
                className="h-10 px-6 rounded-md bg-primary-500 text-background-900 text-[12px] font-semibold hover:bg-primary-400 transition-all cursor-pointer whitespace-nowrap"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.slug}
                  className="flex gap-3 p-3 rounded-lg bg-background-100/50 border border-background-200/40"
                >
                  <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-background-200">
                    <img
                      alt={item.name}
                      className="w-full h-full object-cover object-top"
                      src={item.image}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-foreground-100 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-foreground-500 mt-0.5">{item.spec}</p>
                      </div>
                      <span className="text-[13px] font-display text-foreground-100 whitespace-nowrap">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setQty(item.slug, item.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded border border-background-300 text-foreground-400 hover:text-foreground-100 hover:border-primary-500 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <i className="ri-subtract-line text-[12px]"></i>
                        </button>
                        <span className="w-7 text-center font-mono text-[12px] text-foreground-200">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => setQty(item.slug, item.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded border border-background-300 text-foreground-400 hover:text-foreground-100 hover:border-primary-500 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <i className="ri-add-line text-[12px]"></i>
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.slug)}
                        className="py-2 px-1 text-[11px] text-foreground-500 hover:text-signal transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {hasPeptide && !hasBac && bacOptions.length > 0 && (
                <div className="rounded-lg border-2 border-signal/50 bg-signal/5 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-md bg-signal/15 text-signal">
                      <i className="ri-error-warning-line text-[16px]"></i>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-signal mb-1">
                        Don&apos;t forget BAC Water!
                      </p>
                      <p className="text-[11px] text-foreground-500 leading-relaxed">
                        All peptides are a lyophilized powder and must be reconstituted with
                        Bacteriostatic Water.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {bacOptions.map((bac) => (
                      <button
                        key={bac.slug}
                        onClick={() =>
                          addItem({
                            slug: bac.slug,
                            name: bac.name,
                            spec: bac.spec,
                            price: bac.price,
                            image: bac.image,
                          })
                        }
                        className="flex-1 h-9 rounded-md border border-signal/40 text-signal text-[12px] font-medium hover:bg-signal/10 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {bac.shortLabel ?? bac.name} · ${bac.price.toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-background-200/60 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-[14px]">
              <span className="text-foreground-500">Subtotal</span>
              <span className="font-display text-foreground-100">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[16px] font-semibold pt-2 border-t border-background-200/40">
              <span className="text-foreground-200">Total</span>
              <span className="font-display text-foreground-100">${subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={goCheckout}
              className="w-full h-12 rounded-md bg-primary-500 text-background-900 text-[13px] font-semibold hover:bg-primary-400 transition-all duration-300 ease-precision hover:shadow-[0_0_24px_-4px_rgb(var(--primary-500) / 0.6)] flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <i className="ri-lock-line text-[14px]"></i>Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
