import { describe, expect, it } from "vitest";
import {
  pickRelatedEditorial,
  validateContentReferences,
  type CollectionItem,
  type EditorialItem,
} from "./loader";
import type { CollectionFrontmatter, EditorialFrontmatter } from "./schema";

function makeEditorial(
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
    body: "",
    file: `editorial/${frontmatter.slug}.mdx`,
    readingTimeMinutes: 1,
  };
}

function makeCollection(
  overrides: Partial<CollectionFrontmatter> = {},
): CollectionItem {
  const frontmatter = {
    title: "Test Collection",
    slug: "test-collection",
    description: "desc",
    status: "published",
    heroImage: "/images/content/collections/test-collection.jpg",
    heroImageAlt: "alt",
    heroImageWidth: 2400,
    heroImageHeight: 1600,
    curator: "Tester",
    items: ["test-item"],
    ...overrides,
  } as CollectionFrontmatter;

  return { frontmatter, body: "", file: `collections/${frontmatter.slug}.mdx` };
}

describe("validateContentReferences", () => {
  it("passes when all references resolve", () => {
    const editorial = [makeEditorial({ collectionSlugs: ["test-collection"] })];
    const collections = [makeCollection()];
    expect(validateContentReferences(editorial, collections)).toEqual([]);
  });

  it("flags an editorial item referencing an unknown collection", () => {
    const editorial = [
      makeEditorial({ collectionSlugs: ["missing-collection"] }),
    ];
    const errors = validateContentReferences(editorial, []);
    expect(errors).toHaveLength(1);
    expect(errors[0].messages[0]).toMatch(
      /Unknown collection: missing-collection/,
    );
  });

  it("flags a collection referencing a missing editorial slug", () => {
    const collections = [makeCollection({ items: ["ghost-item"] })];
    const errors = validateContentReferences([], collections);
    expect(errors).toHaveLength(1);
    expect(errors[0].messages[0]).toMatch(
      /Referenced editorial slug does not exist: ghost-item/,
    );
  });

  it("flags a rig referencing a missing relic slug", () => {
    const rig = makeEditorial({
      contentType: "rig",
      slug: "test-rig",
      relicSlugs: ["missing-relic"],
    } as Partial<EditorialFrontmatter>);
    const errors = validateContentReferences([rig], []);
    expect(errors.some((e) => e.messages[0].includes("missing-relic"))).toBe(
      true,
    );
  });

  it("flags duplicate slugs within the same content type", () => {
    const first = makeEditorial();
    const second = makeEditorial();
    const errors = validateContentReferences([first, second], []);
    expect(errors).toHaveLength(2);
    expect(errors[0].messages[0]).toMatch(/Duplicate slug/);
  });

  it("flags duplicate collection slugs", () => {
    const editorial = [makeEditorial()];
    const errors = validateContentReferences(editorial, [
      makeCollection(),
      makeCollection(),
    ]);
    const duplicateErrors = errors.filter((e) =>
      e.messages[0].includes("Duplicate collection slug"),
    );
    expect(duplicateErrors).toHaveLength(2);
  });
});

describe("pickRelatedEditorial", () => {
  it("returns items ranked by shared tag count", () => {
    const item = makeEditorial({
      slug: "target",
      tags: ["steel", "single-speed"],
    });
    const twoShared = makeEditorial({
      slug: "two-shared",
      tags: ["steel", "single-speed"],
    });
    const oneShared = makeEditorial({ slug: "one-shared", tags: ["steel"] });
    const noShared = makeEditorial({ slug: "no-shared", tags: ["carbon"] });

    const result = pickRelatedEditorial(item, [oneShared, noShared, twoShared]);

    expect(result.map((r) => r.frontmatter.slug)).toEqual([
      "two-shared",
      "one-shared",
    ]);
  });

  it("excludes the item itself even if present in candidates", () => {
    const item = makeEditorial({ slug: "target", tags: ["steel"] });
    const result = pickRelatedEditorial(item, [item]);
    expect(result).toEqual([]);
  });

  it("returns an empty array when the item has no tags", () => {
    const item = makeEditorial({ slug: "target", tags: [] });
    const other = makeEditorial({ slug: "other", tags: ["steel"] });
    expect(pickRelatedEditorial(item, [other])).toEqual([]);
  });

  it("breaks ties by publish recency, newest first", () => {
    const item = makeEditorial({ slug: "target", tags: ["steel"] });
    const older = makeEditorial({
      slug: "older",
      tags: ["steel"],
      publishedAt: "2026-01-01",
    });
    const newer = makeEditorial({
      slug: "newer",
      tags: ["steel"],
      publishedAt: "2026-06-01",
    });

    const result = pickRelatedEditorial(item, [older, newer]);

    expect(result.map((r) => r.frontmatter.slug)).toEqual(["newer", "older"]);
  });

  it("respects the limit parameter", () => {
    const item = makeEditorial({ slug: "target", tags: ["steel"] });
    const candidates = [1, 2, 3, 4].map((n) =>
      makeEditorial({ slug: `candidate-${n}`, tags: ["steel"] }),
    );
    expect(pickRelatedEditorial(item, candidates, 2)).toHaveLength(2);
  });
});
