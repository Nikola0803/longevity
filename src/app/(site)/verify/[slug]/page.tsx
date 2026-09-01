import { useParams } from "react-router-dom";
import VerifyClient from "@/components/VerifyClient";

export default function VerifyPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  return <VerifyClient slug={slug} />;
}
