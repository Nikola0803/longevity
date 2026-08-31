"use client";

/**
 * Client-side product catalog, sourced from the CRM/CMS database via
 * /api/store/products — replaces the old static `PRODUCTS` array import.
 * Fetched once per page load and shared through context so every client
 * component (cart, search, product cards, checkout upsells) sees the same
 * live data an operator just edited in /admin/products.
 */

import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "@/lib/product-types";

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
}

const ProductsContext = createContext<ProductsContextValue>({ products: [], loading: true });

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/store/products")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setProducts(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <ProductsContext.Provider value={{ products, loading }}>{children}</ProductsContext.Provider>;
}

export function useProducts(): Product[] {
  return useContext(ProductsContext).products;
}

export function useProductsLoading(): boolean {
  return useContext(ProductsContext).loading;
}
