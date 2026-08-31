import type { MetadataRoute } from "next";

const SITE_URL = "https://longevitypeptides.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout", "/account", "/order-success", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
