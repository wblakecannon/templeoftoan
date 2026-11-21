import type { EditorialItem } from "./loader";
import type { EditorialFrontmatter } from "./schema";

export function makeEditorial(
  overrides: Partial<EditorialFrontmatter> = {},
): EditorialItem {
  const frontmatter = {
    title: "Test",
    slug: "test-item",
    description: "desc",
    contentType: "relic",
    status: "published",
    publishedAt: "2026-01-01",
    featured: false,
    author: "Tester",
    tags: [],
    collectionSlugs: [],
    heroImage: "/images/content/test-item/hero.jpg",
    heroImageAlt: "alt",
    heroImageWidth: 2400,
    heroImageHeight: 1600,
    ...overrides,
  } as EditorialFrontmatter;

  return {
    frontmatter,
    body: "Body text for the test item.",
    file: `editorial/${frontmatter.slug}.mdx`,
    readingTimeMinutes: 1,
  };
}
