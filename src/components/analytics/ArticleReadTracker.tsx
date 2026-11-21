"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/track";

const DWELL_MS = 15000;

/**
 * Fires a single `article_read` event once the reader both reaches the end of
 * the article AND has spent at least ~15s on the page. Rendered as the last
 * child inside <article>, so the invisible sentinel it observes sits at the
 * article's end. A scroll-to-bottom-and-bounce does not count; a genuine read
 * (or a fast scroll that then lingers) does. Fires at most once per page view.
 */
export function ArticleReadTracker({
  contentType,
  slug,
  title,
}: {
  contentType: string;
  slug: string;
  title: string;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;

    const start =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    let dwellTimer: ReturnType<typeof setTimeout> | undefined;

    function fire() {
      if (firedRef.current) return;
      firedRef.current = true;
      trackEvent("article_read", {
        content_type: contentType,
        slug,
        title,
        page_path: window.location.pathname,
      });
      observer.disconnect();
    }

    const observer = new IntersectionObserver((entries) => {
      const reachedEnd = entries.some((entry) => entry.isIntersecting);
      if (!reachedEnd || firedRef.current) return;

      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const elapsed = now - start;
      if (elapsed >= DWELL_MS) {
        fire();
      } else if (dwellTimer === undefined) {
        // Reached the end early; wait out the remaining dwell time.
        dwellTimer = setTimeout(fire, DWELL_MS - elapsed);
      }
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      if (dwellTimer !== undefined) clearTimeout(dwellTimer);
    };
  }, [contentType, slug, title]);

  return <div ref={sentinelRef} aria-hidden="true" />;
}
