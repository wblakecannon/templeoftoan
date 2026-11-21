import type { MetadataRoute } from "next";
import { isIndexingEnabled } from "@/lib/seo/indexing";
import { SITE_URL } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingEnabled()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
