/**
 * Client-side product catalog, sourced directly from WooCommerce's public
 * Store API (see lib/storefront-catalog.ts) — falls back to the static
 * PRODUCTS array when Woo isn't configured/reachable. Fetched once per
 * page load and shared through context so every component (cart, search,
 * product cards, checkout upsells) sees the same catalog.
 */

import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "@/lib/product-types";
import { getAllCatalogProducts } from "@/lib/storefront-catalog";

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
    getAllCatalogProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
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
