import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/assets";

export default function robots(): MetadataRoute.Robots {
  const base = BRAND.siteUrl || "https://www.attention.space";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
