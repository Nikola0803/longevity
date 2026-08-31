import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { RegionProvider } from "@/lib/region";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: {
    default: "VERTALIS · Research Peptides",
    template: "%s · VERTALIS",
  },
  description:
    "Research peptides for laboratory use — dose and pack options (1x/10x), sourced with public batch verification.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css"
        />
      </head>
      <body className="bg-background-800 text-foreground-100 font-sans antialiased min-h-screen">
        <RegionProvider>
          <CartProvider>
            <Header />
            {children}
            <SiteFooter />
            <CartDrawer />
          </CartProvider>
        </RegionProvider>
      </body>
    </html>
  );
}
