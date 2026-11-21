import { describe, expect, it } from "vitest";
import { formatIssueBody } from "./format-issue-body";
import type { ValidatedSubmission } from "../schema";
import type { UploadedMedia } from "../upload/types";

function makeSubmission(
  overrides: Partial<ValidatedSubmission> = {},
): ValidatedSubmission {
  return {
    submissionId: "sub-123",
    receivedAt: "2026-01-01T00:00:00.000Z",
    contributorName: "Blake Cannon",
    contributorEmail: "blake@example.com",
    contributorUrl: "",
    submissionType: "relic",
    proposedTitle: "",
    story: "A great story about a pedal.",
    location: "",
    gearManufacturer: "",
    gearModel: "",
    gearSettings: "",
    photographerCredit: "",
    rightsConfirmed: true,
    editingPermission: true,
    honeypot: "",
    ...overrides,
  };
}

describe("formatIssueBody", () => {
  it("includes core submission fields", () => {
    const body = formatIssueBody(makeSubmission(), []);
    expect(body).toContain("sub-123");
    expect(body).toContain("Blake Cannon");
    expect(body).toContain("blake@example.com");
    expect(body).toContain("A great story about a pedal.");
  });

  it("omits blank optional fields entirely rather than rendering an empty line", () => {
    const body = formatIssueBody(makeSubmission({ location: "" }), []);
    expect(body).not.toMatch(/\*\*Location:\*\*\s*$/m);
  });

  it("includes optional fields when present", () => {
    const body = formatIssueBody(
      makeSubmission({ location: "Golden, Colorado" }),
      [],
    );
    expect(body).toContain("**Location:** Golden, Colorado");
  });

  it("lists photo object keys, never a public URL", () => {
    const media: UploadedMedia[] = [
      {
        objectKey: "submissions/2026/01/sub-123/0-abc.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 12345,
        originalFilename: "IMG_0001.jpg",
      },
    ];
    const body = formatIssueBody(makeSubmission(), media);

    expect(body).toContain("submissions/2026/01/sub-123/0-abc.jpg");
    expect(body).not.toContain("https://");
    expect(body).not.toContain("IMG_0001.jpg");
  });

  it("notes when no photos were attached", () => {
    const body = formatIssueBody(makeSubmission(), []);
    expect(body).toContain("No photos attached");
  });

  it("renders rights and editing permission as Yes/No", () => {
    const body = formatIssueBody(
      makeSubmission({ rightsConfirmed: true, editingPermission: true }),
      [],
    );
    expect(body).toContain("**Rights confirmed:** Yes");
    expect(body).toContain("**Editing permission granted:** Yes");
  });

  it("notes when no GPX file was attached", () => {
    const body = formatIssueBody(makeSubmission(), []);
    expect(body).toContain("None attached");
  });

  it("lists the GPX object key, never a public URL, when attached", () => {
    const gpxFile: UploadedMedia = {
      objectKey: "submissions/2026/01/sub-123/0-abc.gpx",
      mimeType: "application/gpx+xml",
      sizeBytes: 2048,
      originalFilename: "my-route.gpx",
    };
    const body = formatIssueBody(makeSubmission(), [], gpxFile);

    expect(body).toContain("submissions/2026/01/sub-123/0-abc.gpx");
    expect(body).not.toContain("https://");
    expect(body).not.toContain("my-route.gpx");
  });
});
