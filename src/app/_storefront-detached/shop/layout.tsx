import type { Metadata } from "next";

/**
 * app/shop/page.tsx is a client component (interactive filters/sort), so it
 * can't export its own `metadata`. This layout supplies metadata for the
 * exact /shop route; /shop/[category]/page.tsx is a server component with
 * its own generateMetadata that overrides this for nested category routes.
 */
export const metadata: Metadata = {
  title: "Shop Research Peptides",
  description:
    "Browse the full Vertalis research peptide catalog by category or compound. Every product ships lyophilized with a published, batch-searchable Certificate of Analysis.",
  alternates: { canonical: "/shop" },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
