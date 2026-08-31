"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CartItem {
  slug: string;
  name: string;
  spec: string;
  packQty: number;
  price: number;
  image: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  count: number;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (slug: string, packQty: number) => void;
  setQty: (slug: string, packQty: number, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "longevity-cart";

function lineKey(slug: string, packQty: number) {
  return `${slug}::${packQty}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty: number = 1) => {
    setItems((prev) => {
      const key = lineKey(item.slug, item.packQty);
      const existing = prev.find((i) => lineKey(i.slug, i.packQty) === key);
      if (existing) {
        return prev.map((i) =>
          lineKey(i.slug, i.packQty) === key ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...item, qty }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((slug: string, packQty: number) => {
    setItems((prev) => prev.filter((i) => lineKey(i.slug, i.packQty) !== lineKey(slug, packQty)));
  }, []);

  const setQty = useCallback((slug: string, packQty: number, qty: number) => {
    const key = lineKey(slug, packQty);
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => lineKey(i.slug, i.packQty) !== key)
        : prev.map((i) => (lineKey(i.slug, i.packQty) === key ? { ...i, qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((n, i) => n + i.qty * i.price, 0), [items]);

  const value = useMemo(
    () => ({ items, isOpen, count, subtotal, openCart, closeCart, addItem, removeItem, setQty, clearCart }),
    [items, isOpen, count, subtotal, openCart, closeCart, addItem, removeItem, setQty, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
