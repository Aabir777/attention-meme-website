import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/assets";

export default function robots(): MetadataRoute.Robots {
  const base = BRAND.siteUrl || "https://attention-meme-website.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
