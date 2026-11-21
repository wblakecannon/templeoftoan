import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins string arguments with a space", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "", "b")).toBe("a b");
  });

  it("flattens nested arrays", () => {
    expect(cn("a", ["b", ["c", false, "d"]])).toBe("a b c d");
  });

  it("returns an empty string when nothing is truthy", () => {
    expect(cn(false, undefined, null)).toBe("");
  });
});
