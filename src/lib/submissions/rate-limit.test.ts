import { describe, expect, it } from "vitest";
import { RateLimiter } from "./rate-limit";

describe("RateLimiter", () => {
  it("allows requests up to the limit within a window", () => {
    const limiter = new RateLimiter(3, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("a", 10)).toBe(true);
    expect(limiter.check("a", 20)).toBe(true);
  });

  it("rejects requests beyond the limit within the same window", () => {
    const limiter = new RateLimiter(2, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("a", 10)).toBe(true);
    expect(limiter.check("a", 20)).toBe(false);
  });

  it("resets the count once the window has elapsed", () => {
    const limiter = new RateLimiter(1, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("a", 500)).toBe(false);
    expect(limiter.check("a", 1001)).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const limiter = new RateLimiter(1, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("b", 0)).toBe(true);
    expect(limiter.check("a", 10)).toBe(false);
    expect(limiter.check("b", 10)).toBe(false);
  });
});
