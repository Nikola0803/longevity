import { useParams } from "react-router-dom";
import ProductPageClient from "@/components/ProductPageClient";

export default function ProductPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  return <ProductPageClient slug={slug} />;
}
