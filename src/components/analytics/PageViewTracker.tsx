"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics/track";

/**
 * Fires a GA `page_view` on the initial load and on every client-side
 * navigation. The App Router does not do a full page reload between
 * routes, so gtag's built-in pageview (which we disable via
 * `send_page_view: false`) would only ever count the first page. This
 * listener covers the rest.
 *
 * Reads `useSearchParams`, so it must render inside a <Suspense> boundary
 * otherwise it opts the whole route out of static rendering.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    trackEvent("page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}
