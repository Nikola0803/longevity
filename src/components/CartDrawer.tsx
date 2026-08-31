"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";

function formatPrice(price: number) {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, setQty, removeItem } = useCart();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />
      <div className="relative w-full max-w-md h-full bg-background-800 border-l border-background-200/60 flex flex-col animate-slide-in">
        <div className="flex items-center justify-between p-5 border-b border-background-200/60">
          <h2 className="font-display text-[16px] text-foreground-100">Your Cart</h2>
          <button onClick={closeCart} className="text-foreground-400 hover:text-foreground-100" aria-label="Close cart">
            <i className="ri-close-line text-[20px]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 && <p className="text-[13px] text-foreground-500">Your cart is empty.</p>}
          {items.map((item) => (
            <div key={`${item.slug}-${item.packQty}`} className="flex gap-3 items-start">
              <div className="relative w-16 h-16 rounded-md overflow-hidden bg-background-100 shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-foreground-100 truncate">{item.name}</p>
                <p className="font-mono text-[11px] text-foreground-500">
                  {item.spec} · {item.packQty}x
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="number"
                    min={0}
                    value={item.qty}
                    onChange={(e) => setQty(item.slug, item.packQty, parseInt(e.target.value, 10) || 0)}
                    className="w-14 h-7 bg-background-100 border border-background-200 rounded text-[12px] text-center text-foreground-100"
                  />
                  <button onClick={() => removeItem(item.slug, item.packQty)} className="text-[11px] text-signal">
                    Remove
                  </button>
                </div>
              </div>
              <span className="font-mono text-[13px] text-foreground-100">{formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-background-200/60">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] text-foreground-400">Subtotal</span>
            <span className="font-display text-[16px] text-foreground-100">{formatPrice(subtotal)}</span>
          </div>
          <button className="w-full h-11 rounded-lg bg-primary-500 text-background-800 text-[13px] font-semibold hover:bg-primary-400 transition-colors">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
