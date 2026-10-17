import type { MetadataRoute } from "next";
import { URL_SITUS } from "@/lib/konten";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/watchlist"] },
    sitemap: `${URL_SITUS}/sitemap.xml`,
  };
}
