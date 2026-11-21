import { describe, expect, it, vi, beforeEach } from "vitest";

const verifyUploadedObjectMock = vi.fn();
const verifyUploadedGpxFileMock = vi.fn();
const deleteObjectMock = vi.fn().mockResolvedValue(undefined);
const createSubmissionMock = vi.fn();

// The module-level RateLimiter in submit-action.ts is a singleton shared
// across every test in this file (5 requests / 10 min). Give each test
// its own client key so tests don't rate-limit each other.
let clientKeyCounter = 0;
vi.mock("./client-key", () => ({
  getClientKey: vi
    .fn()
    .mockImplementation(async () => `test-client-${clientKeyCounter++}`),
}));

vi.mock("./upload", () => ({
  getMediaUploadTargetService: () => ({
    verifyUploadedObject: verifyUploadedObjectMock,
    verifyUploadedGpxFile: verifyUploadedGpxFileMock,
    deleteObject: deleteObjectMock,
  }),
}));

vi.mock("./service", () => ({
  getSubmissionService: () => ({
    createSubmission: createSubmissionMock,
  }),
}));

const { submitContribution } = await import("./submit-action");

const validImageVerification = {
  isValidImage: true,
  sniffedMimeType: "image/jpeg",
  actualSizeBytes: 12345,
};

function makeFormData(
  overrides: Record<string, string> = {},
  uploadedMedia?: unknown[],
  uploadedGpx?: unknown,
) {
  const formData = new FormData();
  const fields: Record<string, string> = {
    contributorName: "Blake Cannon",
    contributorEmail: "blake@example.com",
    contributorUrl: "",
    submissionType: "relic",
    proposedTitle: "",
    story: "A story about a pedal.",
    location: "",
    gearManufacturer: "",
    gearModel: "",
    gearSettings: "",
    photographerCredit: "",
    rightsConfirmed: "on",
    editingPermission: "on",
    website: "",
    submissionId: "sub-123",
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  formData.set("uploadedMedia", JSON.stringify(uploadedMedia ?? []));
  formData.set("uploadedGpx", uploadedGpx ? JSON.stringify(uploadedGpx) : "");
  return formData;
}

describe("submitContribution", () => {
  beforeEach(() => {
    verifyUploadedObjectMock
      .mockReset()
      .mockResolvedValue(validImageVerification);
    verifyUploadedGpxFileMock
      .mockReset()
      .mockResolvedValue({ isValidGpx: true, actualSizeBytes: 2048 });
    deleteObjectMock.mockReset().mockResolvedValue(undefined);
    createSubmissionMock.mockReset().mockResolvedValue({
      submissionId: "sub-123",
      reference: "console:sub-123",
    });
  });

  it("succeeds with no photos attached", async () => {
    const result = await submitContribution(makeFormData());

    expect(result.status).toBe("success");
    expect(createSubmissionMock).toHaveBeenCalledTimes(1);
  });

  it("succeeds when every claimed photo verifies and still exists on the final check", async () => {
    const media = [
      {
        objectKey: "submissions/2026/01/sub-123/0-uuid.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 999,
        originalFilename: "photo.jpg",
      },
    ];
    const result = await submitContribution(makeFormData({}, media));

    expect(result.status).toBe("success");
    // Verified twice per object: once in the per-file loop, once in the
    // final pre-success re-check.
    expect(verifyUploadedObjectMock).toHaveBeenCalledTimes(2);
    expect(createSubmissionMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({
          objectKey: "submissions/2026/01/sub-123/0-uuid.jpg",
          mimeType: "image/jpeg",
          sizeBytes: 12345,
        }),
      ]),
      undefined,
    );
  });

  it("rejects when a claimed object can't be found during initial verification", async () => {
    verifyUploadedObjectMock.mockRejectedValueOnce(new Error("NoSuchKey"));
    const media = [
      {
        objectKey: "submissions/2026/01/sub-123/0-uuid.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 999,
        originalFilename: "photo.jpg",
      },
    ];

    const result = await submitContribution(makeFormData({}, media));

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.photos).toMatch(/couldn't be found/i);
    expect(createSubmissionMock).not.toHaveBeenCalled();
  });

  it("rejects and deletes the object when it isn't a valid image", async () => {
    verifyUploadedObjectMock.mockResolvedValueOnce({
      isValidImage: false,
      sniffedMimeType: null,
      actualSizeBytes: 999,
    });
    const media = [
      {
        objectKey: "submissions/2026/01/sub-123/0-uuid.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 999,
        originalFilename: "photo.jpg",
      },
    ];

    const result = await submitContribution(makeFormData({}, media));

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.photos).toMatch(/supported image type/i);
    expect(deleteObjectMock).toHaveBeenCalledWith(
      "submissions/2026/01/sub-123/0-uuid.jpg",
    );
    expect(createSubmissionMock).not.toHaveBeenCalled();
  });

  it("rejects when an object verifies initially but is gone by the final pre-success check", async () => {
    verifyUploadedObjectMock
      .mockResolvedValueOnce(validImageVerification) // initial per-file verification
      .mockRejectedValueOnce(new Error("NoSuchKey")); // final re-check

    const media = [
      {
        objectKey: "submissions/2026/01/sub-123/0-uuid.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 999,
        originalFilename: "photo.jpg",
      },
    ];

    const result = await submitContribution(makeFormData({}, media));

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.photos).toMatch(/no longer available/i);
    expect(createSubmissionMock).not.toHaveBeenCalled();
  });

  it("rejects invalid text fields before ever touching uploaded media", async () => {
    const result = await submitContribution(
      makeFormData({ contributorEmail: "not-an-email" }),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.contributorEmail).toBeTruthy();
    expect(verifyUploadedObjectMock).not.toHaveBeenCalled();
  });

  it("rejects a non-empty honeypot", async () => {
    const result = await submitContribution(
      makeFormData({ website: "http://spam.example.com" }),
    );
    expect(result.status).toBe("error");
  });

  it("rejects when submissionId is missing", async () => {
    const formData = makeFormData();
    formData.delete("submissionId");
    const result = await submitContribution(formData);

    expect(result.status).toBe("error");
    expect(result.formError).toBeTruthy();
  });

  it("rejects malformed uploadedMedia JSON", async () => {
    const formData = makeFormData();
    formData.set("uploadedMedia", "not valid json{{{");
    const result = await submitContribution(formData);

    expect(result.status).toBe("error");
    expect(result.formError).toBeTruthy();
  });

  it("succeeds when a claimed GPX file verifies and still exists on the final check", async () => {
    const gpx = {
      objectKey: "submissions/2026/01/sub-123/0-uuid.gpx",
      mimeType: "application/gpx+xml",
      sizeBytes: 999,
      originalFilename: "route.gpx",
    };
    const result = await submitContribution(makeFormData({}, [], gpx));

    expect(result.status).toBe("success");
    expect(verifyUploadedGpxFileMock).toHaveBeenCalledTimes(2);
    expect(createSubmissionMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        objectKey: "submissions/2026/01/sub-123/0-uuid.gpx",
      }),
    );
  });

  it("rejects when a claimed GPX file can't be found during initial verification", async () => {
    verifyUploadedGpxFileMock.mockRejectedValueOnce(new Error("NoSuchKey"));
    const gpx = {
      objectKey: "submissions/2026/01/sub-123/0-uuid.gpx",
      mimeType: "application/gpx+xml",
      sizeBytes: 999,
      originalFilename: "route.gpx",
    };

    const result = await submitContribution(makeFormData({}, [], gpx));

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.gpxFile).toMatch(/couldn't be found/i);
    expect(createSubmissionMock).not.toHaveBeenCalled();
  });

  it("rejects and deletes the GPX object when its content isn't valid GPX", async () => {
    verifyUploadedGpxFileMock.mockResolvedValueOnce({
      isValidGpx: false,
      actualSizeBytes: 999,
    });
    const gpx = {
      objectKey: "submissions/2026/01/sub-123/0-uuid.gpx",
      mimeType: "application/gpx+xml",
      sizeBytes: 999,
      originalFilename: "route.gpx",
    };

    const result = await submitContribution(makeFormData({}, [], gpx));

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.gpxFile).toMatch(/isn't a valid gpx/i);
    expect(deleteObjectMock).toHaveBeenCalledWith(
      "submissions/2026/01/sub-123/0-uuid.gpx",
    );
    expect(createSubmissionMock).not.toHaveBeenCalled();
  });

  it("rejects when the GPX file verifies initially but is gone by the final pre-success check", async () => {
    verifyUploadedGpxFileMock
      .mockResolvedValueOnce({ isValidGpx: true, actualSizeBytes: 999 })
      .mockRejectedValueOnce(new Error("NoSuchKey"));
    const gpx = {
      objectKey: "submissions/2026/01/sub-123/0-uuid.gpx",
      mimeType: "application/gpx+xml",
      sizeBytes: 999,
      originalFilename: "route.gpx",
    };

    const result = await submitContribution(makeFormData({}, [], gpx));

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.gpxFile).toMatch(/no longer available/i);
    expect(createSubmissionMock).not.toHaveBeenCalled();
  });

  it("succeeds with no GPX file and passes undefined to createSubmission", async () => {
    const result = await submitContribution(makeFormData());

    expect(result.status).toBe("success");
    expect(verifyUploadedGpxFileMock).not.toHaveBeenCalled();
    expect(createSubmissionMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      undefined,
    );
  });

  it("rejects malformed uploadedGpx JSON", async () => {
    const formData = makeFormData();
    formData.set("uploadedGpx", "not valid json{{{");
    const result = await submitContribution(formData);

    expect(result.status).toBe("error");
    expect(result.formError).toBeTruthy();
  });
});
