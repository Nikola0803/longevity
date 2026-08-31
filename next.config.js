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
      // Logo + fallback-catalog product photos, hosted on the live
      // WordPress site's asset CDN.
      { protocol: "https", hostname: "longevitytech-lab.store" },
    ],
  },
};

module.exports = nextConfig;
