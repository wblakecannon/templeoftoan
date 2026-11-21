import { getPublishedEditorial } from "@/lib/content/loader";
import { buildRssFeed } from "@/lib/rss/build-feed";
import { isIndexingEnabled } from "@/lib/seo/indexing";
import { SITE_URL } from "@/lib/seo/site-url";

export function GET() {
  if (!isIndexingEnabled()) {
    return new Response("Not found", { status: 404 });
  }

  const feed = buildRssFeed(getPublishedEditorial(), {
    siteUrl: SITE_URL,
    siteTitle: "Temple of Toan",
    siteDescription:
      "A devout, condescending publication about guitar tone: the pedals, amps, rigs, and disciples who will spend anything to find it.",
  });

  return new Response(feed, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
