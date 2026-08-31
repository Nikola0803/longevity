import { notFound } from "next/navigation";
import Image from "next/image";
import { getProducts, getProductBySlug } from "@/lib/woo";
import { getVariants, getRating } from "@/lib/product-types";
import ProductCard from "@/components/ProductCard";
import StarRating from "@/components/StarRating";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, allProducts] = await Promise.all([getProductBySlug(params.slug), getProducts()]);
  if (!product) notFound();

  const rating = getRating(product);
  const variants = getVariants(allProducts, product.name);

  return (
    <main className="px-6 md:px-10 py-16 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-background-100">
          <Image src={product.image} alt={product.imgAlt} fill className="object-cover" />
        </div>
        <div>
          <span className="inline-block px-2 py-0.5 mb-3 rounded-md bg-background-100 font-mono text-[10px] tracking-wider text-foreground-500 uppercase">
            {product.category}
          </span>
          <h1 className="font-display text-[32px] text-foreground-100 mb-2">{product.name}</h1>
          <StarRating stars={rating.stars} count={rating.count} />
          <p className="text-[14px] text-foreground-400 leading-relaxed mt-5 mb-8">{product.description}</p>
          <div className="max-w-sm">
            <ProductCard product={product} allProducts={allProducts} />
          </div>
          {variants.length > 1 && (
            <p className="text-[12px] text-foreground-500 mt-4">
              Also available in: {variants.filter((v) => v.slug !== product.slug).map((v) => v.spec).join(", ")}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
