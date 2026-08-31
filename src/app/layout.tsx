import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "remixicon/fonts/remixicon.css";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// Fallback metadata for any route that doesn't set its own (the storefront
// route group below sets its own richer SEO/OG tags; the /admin CRM
// dashboard is behind auth and doesn't need any).
export const metadata: Metadata = {
  title: "VERTALIS · Research Peptides",
  description:
    "Vertalis Peptides — research-grade peptides with public, batch-searchable Certificates of Analysis, and the Command Center CRM/CMS that runs the whole operation.",
};

// One <html>/<body> for the whole merged app. The buyer-facing storefront
// used to live here as the (site) route group; it's detached for now (see
// src/app/_storefront-detached and QUICKSTART.md), a different frontend will
// consume this app's API instead. The /admin CRM/CMS route group still layers
// its own themed wrapper (and a `.cc-app` class scoping its color tokens)
// inside this shared shell via its own nested layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
