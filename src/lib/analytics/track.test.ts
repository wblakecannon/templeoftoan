import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "./track";
import * as ga from "./ga";

describe("trackEvent", () => {
  beforeEach(() => {
    window.gtag = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete window.gtag;
  });

  it("sends the event when analytics is active and gtag is present", () => {
    vi.spyOn(ga, "isAnalyticsActive").mockReturnValue(true);
    trackEvent("article_read", { slug: "a-story" });
    expect(window.gtag).toHaveBeenCalledWith("event", "article_read", {
      slug: "a-story",
    });
  });

  it("defaults params to an empty object", () => {
    vi.spyOn(ga, "isAnalyticsActive").mockReturnValue(true);
    trackEvent("submission_begin");
    expect(window.gtag).toHaveBeenCalledWith("event", "submission_begin", {});
  });

  it("is a no-op when analytics is inactive (wrong host / opted out)", () => {
    vi.spyOn(ga, "isAnalyticsActive").mockReturnValue(false);
    trackEvent("outbound_click", { link_url: "https://example.com" });
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it("is a no-op when gtag has not loaded", () => {
    vi.spyOn(ga, "isAnalyticsActive").mockReturnValue(true);
    delete window.gtag;
    expect(() => trackEvent("route_download")).not.toThrow();
  });
});
