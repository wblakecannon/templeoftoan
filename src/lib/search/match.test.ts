import { describe, expect, it } from "vitest";
import { searchIndex, tokenize } from "./match";
import type { SearchDocument } from "./types";

function makeDoc(overrides: Partial<SearchDocument> = {}): SearchDocument {
  return {
    slug: "test",
    contentType: "relic",
    url: "/relics/test",
    title: "Test Title",
    description: "Test description",
    author: "Tester",
    tags: [],
    excerpt: "",
    ...overrides,
  };
}

describe("tokenize", () => {
  it("lowercases and splits on whitespace", () => {
    expect(tokenize("Steel Relic")).toEqual(["steel", "relic"]);
  });

  it("collapses repeated whitespace and trims", () => {
    expect(tokenize("  steel   relic  ")).toEqual(["steel", "relic"]);
  });

  it("returns an empty array for a blank query", () => {
    expect(tokenize("   ")).toEqual([]);
  });
});

describe("searchIndex", () => {
  it("returns an empty array for a blank query", () => {
    const index = [makeDoc()];
    expect(searchIndex(index, "")).toEqual([]);
  });

  it("matches on title", () => {
    const index = [
      makeDoc({ slug: "a", title: "Karate Monkey" }),
      makeDoc({ slug: "b", title: "Krampus" }),
    ];
    const results = searchIndex(index, "karate");
    expect(results.map((r) => r.slug)).toEqual(["a"]);
  });

  it("matches on tags", () => {
    const index = [
      makeDoc({ slug: "a", tags: ["steel"] }),
      makeDoc({ slug: "b", tags: ["carbon"] }),
    ];
    const results = searchIndex(index, "steel");
    expect(results.map((r) => r.slug)).toEqual(["a"]);
  });

  it("ranks title matches above excerpt-only matches", () => {
    const index = [
      makeDoc({
        slug: "excerpt-match",
        title: "Unrelated",
        excerpt: "mentions steel in passing",
      }),
      makeDoc({ slug: "title-match", title: "Steel Frame" }),
    ];
    const results = searchIndex(index, "steel");
    expect(results.map((r) => r.slug)).toEqual([
      "title-match",
      "excerpt-match",
    ]);
  });

  it("excludes documents that match no terms", () => {
    const index = [makeDoc({ slug: "a", title: "Karate Monkey" })];
    expect(searchIndex(index, "nonexistent")).toEqual([]);
  });

  it("matches when query terms are spread across different fields", () => {
    const index = [
      makeDoc({ slug: "a", title: "Karate Monkey", tags: ["steel"] }),
    ];
    const results = searchIndex(index, "karate steel");
    expect(results.map((r) => r.slug)).toEqual(["a"]);
  });

  it("still matches a document that only contains one of several query terms", () => {
    const index = [makeDoc({ slug: "a", title: "Karate Monkey" })];
    const results = searchIndex(index, "karate nonexistent");
    expect(results.map((r) => r.slug)).toEqual(["a"]);
  });
});
