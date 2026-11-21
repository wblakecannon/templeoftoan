import { describe, expect, it } from "vitest";
import {
  getCollectionBySlug,
  getEditorialForCollection,
  getPublishedCollections,
} from "./loader";

// These run against the real MDX content on disk, so they fail the suite if a
// member slug is renamed or unpublished out from under a collection (the
// runtime resolver silently drops missing slugs, which these assertions catch).
describe("published collections resolve every member", () => {
  it("every published collection resolves all of its items to published editorial", () => {
    for (const collection of getPublishedCollections()) {
      const resolved = getEditorialForCollection(collection);
      expect(
        resolved.length,
        `collection "${collection.frontmatter.slug}" has unresolved item(s): ` +
          `declared ${collection.frontmatter.items.length}, resolved ${resolved.length}`,
      ).toBe(collection.frontmatter.items.length);
    }
  });

  it("no collection lists the same item twice", () => {
    for (const collection of getPublishedCollections()) {
      const { items } = collection.frontmatter;
      expect(
        new Set(items).size,
        `collection "${collection.frontmatter.slug}" has duplicate items`,
      ).toBe(items.length);
    }
  });
});

describe("Start Here collection", () => {
  it("exists", () => {
    const startHere = getCollectionBySlug("start-here");
    expect(startHere).toBeDefined();
  });

  it("preserves its curated reading order", () => {
    const startHere = getCollectionBySlug("start-here");
    expect(startHere).toBeDefined();
    const resolved = getEditorialForCollection(startHere!);
    expect(resolved.map((item) => item.frontmatter.slug)).toEqual([
      "what-is-toan",
      "fuzz-face-germanium",
    ]);
  });
});
