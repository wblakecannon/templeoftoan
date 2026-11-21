import { contentTypeRoute } from "@/lib/content/schema";
import type { EditorialItem } from "@/lib/content/loader";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface RssFeedOptions {
  siteUrl: string;
  siteTitle: string;
  siteDescription: string;
}

export function buildRssFeed(
  items: EditorialItem[],
  options: RssFeedOptions,
): string {
  const { siteUrl, siteTitle, siteDescription } = options;

  const feedItems = items
    .map((item) => {
      const url = `${siteUrl}/${contentTypeRoute(item.frontmatter.contentType)}/${item.frontmatter.slug}`;
      const pubDate = item.frontmatter.publishedAt
        ? new Date(item.frontmatter.publishedAt).toUTCString()
        : undefined;

      return [
        "<item>",
        `<title>${escapeXml(item.frontmatter.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid>${escapeXml(url)}</guid>`,
        `<description>${escapeXml(item.frontmatter.description)}</description>`,
        pubDate ? `<pubDate>${pubDate}</pubDate>` : "",
        `<author>${escapeXml(item.frontmatter.author)}</author>`,
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "<channel>",
    `<title>${escapeXml(siteTitle)}</title>`,
    `<link>${escapeXml(siteUrl)}</link>`,
    `<description>${escapeXml(siteDescription)}</description>`,
    feedItems,
    "</channel>",
    "</rss>",
  ].join("");
}
