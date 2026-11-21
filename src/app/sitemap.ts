import type { MetadataRoute } from "next";
import { contentTypeRoute } from "@/lib/content/schema";
import {
  getPublishedCollections,
  getPublishedEditorial,
} from "@/lib/content/loader";
import { isIndexingEnabled } from "@/lib/seo/indexing";
import { SITE_URL } from "@/lib/seo/site-url";

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/about", priority: 0.5 },
  { path: "/sermons", priority: 0.7 },
  { path: "/relics", priority: 0.7 },
  { path: "/rigs", priority: 0.7 },
  { path: "/disciples", priority: 0.7 },
  { path: "/tech", priority: 0.7 },
  { path: "/collections", priority: 0.7 },
  { path: "/submit", priority: 0.4 },
  { path: "/privacy", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexingEnabled()) return [];

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority,
    }),
  );

  const editorialEntries: MetadataRoute.Sitemap = getPublishedEditorial().map(
    (item) => ({
      url: `${SITE_URL}/${contentTypeRoute(item.frontmatter.contentType)}/${item.frontmatter.slug}`,
      lastModified: item.frontmatter.updatedAt ?? item.frontmatter.publishedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );

  const collectionEntries: MetadataRoute.Sitemap =
    getPublishedCollections().map((item) => ({
      url: `${SITE_URL}/collections/${item.frontmatter.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticEntries, ...editorialEntries, ...collectionEntries];
}
