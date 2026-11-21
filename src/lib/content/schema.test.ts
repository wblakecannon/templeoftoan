import { describe, expect, it } from "vitest";
import {
  collectionFrontmatterSchema,
  contentTypeRoute,
  editorialFrontmatterSchema,
} from "./schema";

const baseBike = {
  title: "Test Bike",
  slug: "test-bike",
  description: "A test bike",
  contentType: "relic" as const,
  status: "draft" as const,
  featured: false,
  author: "Tester",
  tags: [],
  collectionSlugs: [],
  heroImage: "/images/content/test-bike/hero.jpg",
  heroImageAlt: "Alt text",
  heroImageWidth: 2400,
  heroImageHeight: 1600,
};

describe("editorialFrontmatterSchema", () => {
  it("accepts a valid draft without publishedAt", () => {
    const result = editorialFrontmatterSchema.safeParse(baseBike);
    expect(result.success).toBe(true);
  });

  it("rejects published content missing publishedAt", () => {
    const result = editorialFrontmatterSchema.safeParse({
      ...baseBike,
      status: "published",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes("publishedAt")),
      ).toBe(true);
    }
  });

  it("accepts published content with publishedAt", () => {
    const result = editorialFrontmatterSchema.safeParse({
      ...baseBike,
      status: "published",
      publishedAt: "2026-01-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid slug format", () => {
    const result = editorialFrontmatterSchema.safeParse({
      ...baseBike,
      slug: "Not A Slug",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown contentType", () => {
    const result = editorialFrontmatterSchema.safeParse({
      ...baseBike,
      contentType: "vehicle",
    });
    expect(result.success).toBe(false);
  });

  it("allows bike-specific optional fields", () => {
    const result = editorialFrontmatterSchema.safeParse({
      ...baseBike,
      manufacturer: "Surly",
      gearRatio: "32:20",
    });
    expect(result.success).toBe(true);
  });
});

describe("collectionFrontmatterSchema", () => {
  it("requires at least one item", () => {
    const result = collectionFrontmatterSchema.safeParse({
      title: "Test Collection",
      slug: "test-collection",
      description: "A test collection",
      status: "draft",
      heroImage: "/images/content/collections/test-collection.jpg",
      heroImageAlt: "Alt text",
      heroImageWidth: 2400,
      heroImageHeight: 1600,
      curator: "Tester",
      items: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("contentTypeRoute", () => {
  it("maps each content type to its route segment", () => {
    expect(contentTypeRoute("sermon")).toBe("sermons");
    expect(contentTypeRoute("relic")).toBe("relics");
    expect(contentTypeRoute("rig")).toBe("rigs");
    expect(contentTypeRoute("disciple")).toBe("disciples");
    expect(contentTypeRoute("tech")).toBe("tech");
  });
});
