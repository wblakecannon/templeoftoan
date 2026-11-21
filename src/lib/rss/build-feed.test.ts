import { describe, expect, it } from "vitest";
import { buildRssFeed } from "./build-feed";
import { makeEditorial } from "@/lib/content/test-fixtures";

const options = {
  siteUrl: "https://example.com",
  siteTitle: "Test Site",
  siteDescription: "A test site",
};

describe("buildRssFeed", () => {
  it("produces valid RSS 2.0 XML with a channel and no items", () => {
    const xml = buildRssFeed([], options);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain("<title>Test Site</title>");
    expect(xml).toContain("<link>https://example.com</link>");
  });

  it("includes one <item> per editorial item with an absolute link", () => {
    const items = [
      makeEditorial({
        slug: "my-bike",
        contentType: "relic",
        title: "My Bike",
      }),
    ];
    const xml = buildRssFeed(items, options);

    expect(xml).toContain("<title>My Bike</title>");
    expect(xml).toContain("<link>https://example.com/relics/my-bike</link>");
    expect(xml).toContain("<guid>https://example.com/relics/my-bike</guid>");
  });

  it("escapes XML-significant characters in title and description", () => {
    const items = [
      makeEditorial({
        slug: "escaped",
        title: 'A "Test" & <Bike>',
        description: "Rock & roll",
      }),
    ];
    const xml = buildRssFeed(items, options);

    expect(xml).not.toContain("<Bike>");
    expect(xml).toContain("&amp;");
    expect(xml).toContain("&quot;");
    expect(xml).toContain("&lt;Bike&gt;");
  });

  it("omits pubDate when publishedAt is not set", () => {
    const items = [
      makeEditorial({ slug: "draft", status: "draft", publishedAt: undefined }),
    ];
    const xml = buildRssFeed(items, options);
    expect(xml).not.toContain("<pubDate>");
  });
});
