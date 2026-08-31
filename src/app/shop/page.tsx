import { getProducts } from "@/lib/woo";
import ProductCard from "@/components/ProductCard";

export const metadata = { title: "Shop" };

export default async function ShopPage() {
  const products = await getProducts();
  const uniqueByName = Array.from(new Map(products.map((p) => [p.name, p])).values());

  return (
    <main className="px-6 md:px-10 py-16 max-w-[1440px] mx-auto">
      <h1 className="font-display text-[32px] text-foreground-100 mb-2">Shop</h1>
      <p className="text-[13px] text-foreground-500 mb-10">
        {uniqueByName.length} compound{uniqueByName.length === 1 ? "" : "s"} · dose + pack (1x/10x) options on each
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {uniqueByName.map((p) => (
          <ProductCard key={p.slug} product={p} allProducts={products} />
        ))}
      </div>
    </main>
  );
}
