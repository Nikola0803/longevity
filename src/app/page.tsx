import Link from "next/link";
import { getProducts } from "@/lib/woo";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  const products = await getProducts();
  const uniqueByName = Array.from(new Map(products.map((p) => [p.name, p])).values()).slice(0, 8);

  return (
    <main>
      <section className="relative px-6 md:px-10 py-24 md:py-32 max-w-[1440px] mx-auto text-center">
        <span className="font-mono text-[11px] tracking-[0.3em] text-primary-500 uppercase">Research-Grade Peptides</span>
        <h1 className="font-display text-[40px] md:text-[64px] leading-[1.05] text-foreground-100 mt-4 mb-6">
          Precision peptides,
          <br />
          built for research protocols.
        </h1>
        <p className="text-[15px] text-foreground-400 max-w-xl mx-auto mb-8">
          Choose your dose, choose your pack size — 1x for a single research run, 10x for ongoing studies.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 h-12 px-7 rounded-lg bg-primary-500 text-background-800 text-[14px] font-semibold hover:bg-primary-400 transition-colors"
        >
          Shop the Catalog
          <i className="ri-arrow-right-line" />
        </Link>
      </section>

      <section className="px-6 md:px-10 pb-24 max-w-[1440px] mx-auto">
        <h2 className="font-display text-[24px] text-foreground-100 mb-8">Featured Compounds</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {uniqueByName.map((p) => (
            <ProductCard key={p.slug} product={p} allProducts={products} />
          ))}
        </div>
      </section>
    </main>
  );
}
