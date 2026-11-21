import { describe, expect, it } from "vitest";
import {
  breadcrumbsForCollection,
  breadcrumbsForEditorial,
  buildArticleSchema,
  buildBreadcrumbSchema,
} from "./structured-data";
import { makeEditorial } from "@/lib/content/test-fixtures";

const SITE_URL = "https://example.com";

describe("buildArticleSchema", () => {
  it("builds a schema.org Article with an absolute image URL", () => {
    const item = makeEditorial({ slug: "my-bike", title: "My Bike" });
    const schema = buildArticleSchema(item.frontmatter, SITE_URL);

    expect(schema["@type"]).toBe("Article");
    expect(schema.headline).toBe("My Bike");
    expect(schema.image).toBe(`${SITE_URL}${item.frontmatter.heroImage}`);
    expect(schema.mainEntityOfPage["@id"]).toBe(`${SITE_URL}/relics/my-bike`);
  });

  it("falls back to publishedAt for dateModified when updatedAt is unset", () => {
    const item = makeEditorial({
      publishedAt: "2026-01-01",
      updatedAt: undefined,
    });
    const schema = buildArticleSchema(item.frontmatter, SITE_URL);
    expect(schema.dateModified).toBe("2026-01-01");
  });
});

describe("breadcrumbsForEditorial", () => {
  it("builds Home > Section > Title segments", () => {
    const item = makeEditorial({
      contentType: "relic",
      slug: "my-bike",
      title: "My Bike",
    });
    const segments = breadcrumbsForEditorial(item.frontmatter);

    expect(segments).toEqual([
      { name: "Home", path: "/" },
      { name: "Relics", path: "/relics" },
      { name: "My Bike", path: "/relics/my-bike" },
    ]);
  });
});

describe("breadcrumbsForCollection", () => {
  it("builds Home > Collections > Title segments", () => {
    const segments = breadcrumbsForCollection("Steel Forever", "steel-forever");
    expect(segments).toEqual([
      { name: "Home", path: "/" },
      { name: "Collections", path: "/collections" },
      { name: "Steel Forever", path: "/collections/steel-forever" },
    ]);
  });
});

describe("buildBreadcrumbSchema", () => {
  it("builds a schema.org BreadcrumbList with absolute item URLs", () => {
    const schema = buildBreadcrumbSchema(
      [
        { name: "Home", path: "/" },
        { name: "Relics", path: "/relics" },
      ],
      SITE_URL,
    );

    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Relics",
        item: `${SITE_URL}/relics`,
      },
    ]);
  });
});
