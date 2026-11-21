import { describe, expect, it } from "vitest";
import { submissionFormSchema } from "./schema";

const validSubmission = {
  contributorName: "Blake Cannon",
  contributorEmail: "blake@example.com",
  contributorUrl: "",
  submissionType: "relic" as const,
  proposedTitle: "",
  story: "A story about a pedal.",
  location: "",
  gearManufacturer: "",
  gearModel: "",
  gearSettings: "",
  photographerCredit: "",
  rightsConfirmed: true as const,
  editingPermission: true as const,
  honeypot: "",
};

describe("submissionFormSchema", () => {
  it("accepts a fully valid submission", () => {
    expect(submissionFormSchema.safeParse(validSubmission).success).toBe(true);
  });

  it("rejects a missing contributor name", () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      contributorName: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      contributorEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown submission type", () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      submissionType: "vehicle",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when rightsConfirmed is false", () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      rightsConfirmed: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects when editingPermission is false", () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      editingPermission: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-empty honeypot with a generic error message", () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      honeypot: "http://spam.example.com",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues[0].message;
      expect(message).not.toMatch(/honeypot/i);
      expect(message).not.toMatch(/expected/i);
    }
  });

  it("accepts optional fields left blank", () => {
    const result = submissionFormSchema.safeParse(validSubmission);
    expect(result.success).toBe(true);
  });

  it("accepts optional fields when filled in", () => {
    const result = submissionFormSchema.safeParse({
      ...validSubmission,
      gearManufacturer: "Surly",
      gearModel: "Karate Monkey",
      gearSettings: "32:20",
    });
    expect(result.success).toBe(true);
  });
});
