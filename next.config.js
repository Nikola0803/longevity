/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "longevitypeptides.com", "www.longevitypeptides.com"],
    },
  },
  images: {
    remotePatterns: [
      // Product/CMS images uploaded via /api/admin/upload land here on
      // Vercel (see route.ts) — next/image needs the host allow-listed.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

module.exports = nextConfig;
