import { describe, expect, it } from "vitest";
import { generateObjectKey, generateSubmissionId } from "./object-key";

describe("generateObjectKey", () => {
  it("nests under submissions/YYYY/MM/[submissionId]/", () => {
    const key = generateObjectKey("abc-123", 0, "jpg");
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");

    expect(key).toMatch(
      new RegExp(`^submissions/${year}/${month}/abc-123/0-[0-9a-f-]+\\.jpg$`),
    );
  });

  it("never contains the original filename", () => {
    const key = generateObjectKey("abc-123", 0, "jpg");
    expect(key).not.toContain(" ");
    expect(key).not.toContain("..");
  });

  it("produces distinct keys for repeated calls with the same index", () => {
    const first = generateObjectKey("abc-123", 0, "jpg");
    const second = generateObjectKey("abc-123", 0, "jpg");
    expect(first).not.toBe(second);
  });

  it("includes the file's position among the submission's files", () => {
    const key = generateObjectKey("abc-123", 3, "png");
    expect(key).toContain("/3-");
  });
});

describe("generateSubmissionId", () => {
  it("produces a valid UUID", () => {
    const id = generateSubmissionId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("produces distinct IDs on repeated calls", () => {
    expect(generateSubmissionId()).not.toBe(generateSubmissionId());
  });
});
