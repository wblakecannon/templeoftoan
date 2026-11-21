/**
 * Google Analytics is opt-in, mirroring the indexing gate. Only the real
 * production deployment (www.templeoftoan.com) sets
 * NEXT_PUBLIC_ENABLE_ANALYTICS=true. Every other environment
 * (local dev, previews, dev.templeoftoan.com) leaves it unset/false,
 * so GA never fires on non-production traffic. Kept separate from the
 * indexing flag so analytics can be toggled independently.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * The only hosts real analytics traffic is allowed from. This is an explicit
 * allowlist rather than a NODE_ENV or substring check, so dev.templeoftoan.com,
 * localhost, preview URLs, and *.amplifyapp.com are all excluded by construction.
 */
export const PRODUCTION_HOSTS = ["templeoftoan.com", "www.templeoftoan.com"];

/**
 * localStorage key for the personal opt-out. Set it to "1" in a browser to
 * stop that browser from being counted, even on the production host:
 *   localStorage.setItem("toan_analytics_opt_out", "1")
 */
export const ANALYTICS_OPT_OUT_KEY = "toan_analytics_opt_out";

/**
 * Build-time gate. Both env vars must be set, and the flag must be exactly
 * "true". Controls whether the gtag scripts render at all. Only the real
 * production deployment sets these; dev/preview/local leave them unset.
 */
export function isAnalyticsEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true" &&
    Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
  );
}

/** True only for the exact production hosts (case-insensitive, port ignored). */
export function isProductionHost(hostname: string): boolean {
  const host = hostname.toLowerCase().split(":")[0];
  return PRODUCTION_HOSTS.includes(host);
}

/**
 * True if this browser has opted out via localStorage. Wrapped in try/catch
 * because storage access throws in some privacy modes; any failure counts as
 * "not opted out" so analytics still works for normal visitors.
 */
export function hasOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Runtime gate that every event and the interaction listeners pass through.
 * Belt and suspenders on top of the env gate: even a production build artifact
 * served from the wrong host, or a browser that opted out, sends nothing.
 */
export function isAnalyticsActive(): boolean {
  return (
    typeof window !== "undefined" &&
    isAnalyticsEnabled() &&
    isProductionHost(window.location.hostname) &&
    !hasOptedOut()
  );
}
