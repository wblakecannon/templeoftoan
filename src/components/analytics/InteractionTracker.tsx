"use client";

import { useEffect } from "react";
import { ANALYTICS_OPT_OUT_KEY, isProductionHost } from "@/lib/analytics/ga";
import { trackEvent } from "@/lib/analytics/track";

/**
 * A single document-level click listener that catches two kinds of link the
 * site renders as plain server-rendered <a> tags: GPX/route downloads and
 * outbound links. Doing it here with event delegation avoids turning
 * RouteSummary, SocialLinks, the about page, and every MDX body link into
 * client components. Every event still passes through `trackEvent`, so nothing
 * fires off-production or for an opted-out visitor.
 *
 * Also exposes console-friendly opt-out/opt-in helpers on the production host,
 * so the owner can silence their own visits without opening devtools storage.
 */
export function InteractionTracker() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      isProductionHost(window.location.hostname)
    ) {
      window.__toanOptOutAnalytics = () => {
        try {
          window.localStorage.setItem(ANALYTICS_OPT_OUT_KEY, "1");
        } catch {
          // storage unavailable; nothing to do
        }
      };
      window.__toanOptInAnalytics = () => {
        try {
          window.localStorage.removeItem(ANALYTICS_OPT_OUT_KEY);
        } catch {
          // storage unavailable; nothing to do
        }
      };
    }

    function handleClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      const pagePath = window.location.pathname;

      // Route / GPX download: an explicit download attribute or a .gpx target.
      const isGpx = /\.gpx(\?|#|$)/i.test(href);
      if (anchor.hasAttribute("download") || isGpx) {
        const fileName = href.split(/[?#]/)[0].split("/").pop() ?? href;
        trackEvent("route_download", {
          file_name: fileName,
          link_url: href,
          page_path: pagePath,
        });
        return;
      }

      // Outbound link: an absolute http(s) URL to a different, non-production
      // host. Same-host links and internal navigation are ignored.
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") return;

      const linkHost = url.hostname.toLowerCase();
      const sameHost = linkHost === window.location.hostname.toLowerCase();
      if (sameHost || isProductionHost(linkHost)) return;

      trackEvent("outbound_click", {
        link_url: url.href,
        link_domain: linkHost,
        page_path: pagePath,
      });
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null;
}
