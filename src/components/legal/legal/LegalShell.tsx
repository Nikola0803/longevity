import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import { LegalHero, RelatedLinks } from "@/components/legal/LegalUI";

/**
 * Standard frame for every legal document page.
 * Renders the site Header + a dark legal hero, then the page body inside
 * an 860px reading column, followed by related-document links.
 * The global SiteFooter (mounted in app/layout.tsx) closes the page.
 */
export default function LegalShell({
  line1,
  line2,
  breadcrumb,
  related,
  children,
}: {
  line1: string;
  line2: string;
  breadcrumb: string;
  related: { label: string; href: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-800 text-foreground-100">
      <PromoBanner /><Header />
      <main className="pt-[112px]">
        <LegalHero line1={line1} line2={line2} breadcrumb={breadcrumb} />
        <div className="w-full max-w-[860px] mx-auto px-6 md:px-10 py-16">
          <div className="space-y-10">{children}</div>
          <RelatedLinks links={related} />
        </div>
      </main>
    </div>
  );
}
