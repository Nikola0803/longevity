"use client";

import { useCart } from "@/lib/cart-context";
import { PRODUCTS } from "@/data/products";

const BAC_SLUGS = ["nvr-bac-5", "nvr-bac-10"];
const FREE_SHIPPING_THRESHOLD = 300;

export default function CheckoutSummary() {
  const { items, addItem, removeItem, setQty, subtotal, count } = useCart();

  const hasPeptide = items.some((i) => !BAC_SLUGS.includes(i.slug));
  const hasBac = items.some((i) => BAC_SLUGS.includes(i.slug));
  const bacOptions = PRODUCTS.filter((p) => BAC_SLUGS.includes(p.slug));

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingUnlocked = remainingForFreeShipping === 0;
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <>
      {items.length > 0 && (
        <div className="p-4 border-b border-background-200/40">
          <div className="flex items-center gap-2 mb-2.5">
            <i className={`${freeShippingUnlocked ? "ri-checkbox-circle-fill" : "ri-truck-line"} text-[14px] text-primary-500 shrink-0`}></i>
            <p className="text-[12px] text-foreground-300">
              {freeShippingUnlocked ? (
                <span className="font-medium text-primary-500">You&apos;ve unlocked free shipping!</span>
              ) : (
                <>
                  You&apos;re <span className="font-semibold text-foreground-100">${remainingForFreeShipping.toFixed(2)}</span> away from free shipping
                </>
              )}
            </p>
          </div>
          <div className="h-1.5 w-full rounded-full bg-background-200/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500 ease-out"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>
      )}
      <div className="divide-y divide-background-200/40">
        {items.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-[13px] text-foreground-400">Your cart is empty.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.slug} className="flex items-center gap-4 p-4">
              <div className="w-14 h-14 shrink-0 rounded-md overflow-hidden bg-background-200">
                <img
                  alt={item.name}
                  className="w-full h-full object-cover object-top"
                  src={item.image}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground-100 truncate">
                  {item.name}
                </p>
                <p className="text-[11px] text-foreground-500 mt-0.5">{item.spec}</p>
                <div className="flex items-center gap-1 mt-1">
                  <button
                    type="button"
                    onClick={() => setQty(item.slug, item.qty - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded border border-background-300 text-foreground-400 hover:text-foreground-100 transition-colors cursor-pointer"
                    aria-label="Decrease"
                  >
                    <i className="ri-subtract-line text-[11px]"></i>
                  </button>
                  <span className="w-6 text-center font-mono text-[11px] text-foreground-300">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(item.slug, item.qty + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded border border-background-300 text-foreground-400 hover:text-foreground-100 transition-colors cursor-pointer"
                    aria-label="Increase"
                  >
                    <i className="ri-add-line text-[11px]"></i>
                  </button>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[14px] font-display text-foreground-100">
                  ${(item.price * item.qty).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.slug)}
                  className="block mt-1 ml-auto text-[10px] text-foreground-500 hover:text-signal transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {hasPeptide && !hasBac && bacOptions.length > 0 && (
        <div className="p-4 border-t border-background-200/40 bg-signal/5">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md bg-signal/15 text-signal mt-0.5">
              <i className="ri-error-warning-line text-[14px]"></i>
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-signal mb-1">
                Don&apos;t forget BAC Water!
              </p>
              <p className="text-[11px] text-foreground-500 leading-relaxed mb-2">
                All peptides are lyophilized powder and require reconstitution with
                Bacteriostatic Water.
              </p>
              <div className="flex items-center gap-2">
                {bacOptions.map((bac) => (
                  <button
                    key={bac.slug}
                    type="button"
                    onClick={() =>
                      addItem({
                        slug: bac.slug,
                        name: bac.name,
                        spec: bac.spec,
                        price: bac.price,
                        image: bac.image,
                      })
                    }
                    className="h-8 px-3 rounded-md border border-signal/40 text-signal text-[11px] font-medium hover:bg-signal/10 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {bac.shortLabel ?? bac.name} · ${bac.price.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 border-t border-background-200/60 space-y-2">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-foreground-500">
            Subtotal ({count} items)
          </span>
          <span className="font-display text-foreground-200">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-[16px] font-semibold pt-2 border-t border-background-200/40">
          <span className="text-foreground-200">Total</span>
          <span className="font-display text-foreground-100">${subtotal.toFixed(2)}</span>
        </div>
      </div>
    </>
  );
}
