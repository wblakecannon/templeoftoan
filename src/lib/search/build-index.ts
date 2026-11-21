import { contentTypeRoute } from "@/lib/content/schema";
import type { EditorialItem } from "@/lib/content/loader";
import type { SearchDocument, SearchIndex } from "./types";

const EXCERPT_LENGTH = 280;

function toExcerpt(body: string): string {
  const plain = body
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`>[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.slice(0, EXCERPT_LENGTH);
}

export function toSearchDocument(item: EditorialItem): SearchDocument {
  const { frontmatter } = item;

  return {
    slug: frontmatter.slug,
    contentType: frontmatter.contentType,
    url: `/${contentTypeRoute(frontmatter.contentType)}/${frontmatter.slug}`,
    title: frontmatter.title,
    description: frontmatter.description,
    author: frontmatter.author,
    location: frontmatter.location,
    tags: frontmatter.tags,
    manufacturer:
      frontmatter.contentType === "relic"
        ? frontmatter.manufacturer
        : undefined,
    model: frontmatter.contentType === "relic" ? frontmatter.model : undefined,
    circuit:
      frontmatter.contentType === "relic" ? frontmatter.circuit : undefined,
    excerpt: toExcerpt(item.body),
  };
}

export function buildSearchIndex(items: EditorialItem[]): SearchIndex {
  return items.map(toSearchDocument);
}
