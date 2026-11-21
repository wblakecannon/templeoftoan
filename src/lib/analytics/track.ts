import { isAnalyticsActive } from "@/lib/analytics/ga";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __toanOptOutAnalytics?: () => void;
    __toanOptInAnalytics?: () => void;
  }
}

/**
 * The single entry point for every GA4 event. It enforces the runtime gate
 * (production host, analytics enabled, not opted out) in one place, so no call
 * site can send an event on the wrong host or for an opted-out visitor. A no-op
 * whenever analytics is inactive or gtag has not loaded.
 */
export function trackEvent(
  name: string,
  params?: Record<string, unknown>,
): void {
  if (!isAnalyticsActive()) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}
