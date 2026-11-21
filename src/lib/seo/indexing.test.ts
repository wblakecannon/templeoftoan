import { afterEach, describe, expect, it } from "vitest";
import { isIndexingEnabled } from "./indexing";

describe("isIndexingEnabled", () => {
  const originalValue = process.env.NEXT_PUBLIC_ENABLE_INDEXING;

  afterEach(() => {
    process.env.NEXT_PUBLIC_ENABLE_INDEXING = originalValue;
  });

  it("defaults to disabled when unset", () => {
    delete process.env.NEXT_PUBLIC_ENABLE_INDEXING;
    expect(isIndexingEnabled()).toBe(false);
  });

  it("stays disabled for any value other than the string 'true'", () => {
    process.env.NEXT_PUBLIC_ENABLE_INDEXING = "1";
    expect(isIndexingEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_ENABLE_INDEXING = "True";
    expect(isIndexingEnabled()).toBe(false);
  });

  it("enables only when explicitly set to 'true'", () => {
    process.env.NEXT_PUBLIC_ENABLE_INDEXING = "true";
    expect(isIndexingEnabled()).toBe(true);
  });
});
