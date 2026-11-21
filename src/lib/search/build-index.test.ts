import { describe, expect, it } from "vitest";
import { buildSearchIndex, toSearchDocument } from "./build-index";
import { makeEditorial } from "@/lib/content/test-fixtures";

describe("toSearchDocument", () => {
  it("maps editorial frontmatter to a search document", () => {
    const item = makeEditorial({
      slug: "test-bike",
      title: "Test Bike",
      tags: ["steel", "single-speed"],
      manufacturer: "Arbiter",
      model: "Fuzz Face",
      circuit: "Fuzz",
    });

    const doc = toSearchDocument(item);

    expect(doc).toMatchObject({
      slug: "test-bike",
      contentType: "relic",
      url: "/relics/test-bike",
      title: "Test Bike",
      tags: ["steel", "single-speed"],
      manufacturer: "Arbiter",
      model: "Fuzz Face",
      circuit: "Fuzz",
    });
    expect(doc.excerpt).toContain("Body text for the test item");
  });

  it("omits relic-specific fields for non-relic content types", () => {
    const item = makeEditorial({ contentType: "sermon", slug: "test-story" });
    const doc = toSearchDocument(item);

    expect(doc.manufacturer).toBeUndefined();
    expect(doc.model).toBeUndefined();
    expect(doc.circuit).toBeUndefined();
  });

  it("strips markdown syntax from the excerpt", () => {
    const item = makeEditorial({ slug: "test-md" });
    item.body =
      "# Heading\n\n**bold** and _italic_ and `code` and [a link](https://example.com)";
    const doc = toSearchDocument(item);

    expect(doc.excerpt).not.toMatch(/[#*_`[\]]/);
  });
});

describe("buildSearchIndex", () => {
  it("builds one document per item", () => {
    const items = [makeEditorial({ slug: "a" }), makeEditorial({ slug: "b" })];
    expect(buildSearchIndex(items)).toHaveLength(2);
  });
});
