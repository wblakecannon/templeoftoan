import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ANALYTICS_OPT_OUT_KEY,
  hasOptedOut,
  isAnalyticsEnabled,
  isProductionHost,
} from "./ga";

/** Minimal in-memory localStorage; jsdom here does not provide a working one. */
function createStorageMock(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    setItem: (key, value) => void store.set(key, String(value)),
    removeItem: (key) => void store.delete(key),
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
}

describe("isAnalyticsEnabled", () => {
  const originalFlag = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS;
  const originalId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  afterEach(() => {
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = originalFlag;
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalId;
  });

  it("defaults to disabled when the flag is unset", () => {
    delete process.env.NEXT_PUBLIC_ENABLE_ANALYTICS;
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-CXKQMHD7BP";
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("stays disabled for any flag value other than the string 'true'", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-CXKQMHD7BP";
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = "1";
    expect(isAnalyticsEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = "True";
    expect(isAnalyticsEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = "false";
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("stays disabled when the flag is on but no measurement ID is set", () => {
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = "true";
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    expect(isAnalyticsEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "";
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("enables only when the flag is 'true' and an ID is present", () => {
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = "true";
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-CXKQMHD7BP";
    expect(isAnalyticsEnabled()).toBe(true);
  });
});

describe("isProductionHost", () => {
  it("accepts the exact production hosts", () => {
    expect(isProductionHost("templeoftoan.com")).toBe(true);
    expect(isProductionHost("www.templeoftoan.com")).toBe(true);
  });

  it("ignores case and a trailing port", () => {
    expect(isProductionHost("WWW.TempleOfToan.com")).toBe(true);
    expect(isProductionHost("www.templeoftoan.com:443")).toBe(true);
  });

  it("rejects dev, preview, localhost, and lookalike hosts", () => {
    expect(isProductionHost("dev.templeoftoan.com")).toBe(false);
    expect(isProductionHost("localhost")).toBe(false);
    expect(isProductionHost("main.d123.amplifyapp.com")).toBe(false);
    expect(isProductionHost("templeoftoan.com.evil.example")).toBe(false);
    expect(isProductionHost("")).toBe(false);
  });
});

describe("hasOptedOut", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is false when the key is unset", () => {
    expect(hasOptedOut()).toBe(false);
  });

  it("is true only when the key is exactly '1'", () => {
    localStorage.setItem(ANALYTICS_OPT_OUT_KEY, "1");
    expect(hasOptedOut()).toBe(true);
    localStorage.setItem(ANALYTICS_OPT_OUT_KEY, "yes");
    expect(hasOptedOut()).toBe(false);
  });
});
