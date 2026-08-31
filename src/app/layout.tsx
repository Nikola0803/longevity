import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "remixicon/fonts/remixicon.css";
import "./globals.css";

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

// Fallback metadata for any route that doesn't set its own (the (site)
// route group below sets its own richer SEO/OG tags).
export const metadata: Metadata = {
  title: "LONGEVITY PEPTIDES · Research Peptides",
  description:
    "Longevity Peptides — research-grade peptides with public, batch-searchable Certificates of Analysis, sourced from WooCommerce.",
};

// One <html>/<body> for the whole app. The (site) route group layers its
// own themed wrapper on top of this shared shell via its own layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
