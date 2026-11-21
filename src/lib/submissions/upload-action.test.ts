import { describe, expect, it, vi, beforeEach } from "vitest";

const createUploadTargetsMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock("./upload", () => ({
  getMediaUploadTargetService: () => ({
    createUploadTargets: createUploadTargetsMock,
  }),
}));

const { prepareUpload } = await import("./upload-action");

function makeFile(
  overrides: Partial<{
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
  }> = {},
) {
  return {
    originalFilename: "photo.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 1024,
    ...overrides,
  };
}

describe("prepareUpload", () => {
  beforeEach(() => {
    createUploadTargetsMock.mockReset();
    createUploadTargetsMock.mockResolvedValue([
      {
        objectKey: "submissions/2026/01/sub/0-uuid.jpg",
        mimeType: "image/jpeg",
        uploadUrl: "https://example.com/signed",
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        expiresInSeconds: 300,
      },
    ]);
  });

  it("returns upload targets for valid declared files", async () => {
    const result = await prepareUpload([makeFile()]);

    expect(result.status).toBe("ok");
    expect(result.submissionId).toBeTruthy();
    expect(result.uploads).toHaveLength(1);
    expect(result.uploads?.[0]).toMatchObject({
      objectKey: "submissions/2026/01/sub/0-uuid.jpg",
      uploadUrl: "https://example.com/signed",
    });
  });

  it("rejects more files than SUBMISSION_MAX_FILES", async () => {
    const files = Array.from({ length: 7 }, (_, i) =>
      makeFile({ originalFilename: `p${i}.jpg` }),
    );
    const result = await prepareUpload(files);

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.photos).toMatch(/at most/i);
    expect(createUploadTargetsMock).not.toHaveBeenCalled();
  });

  it("rejects when total declared size exceeds SUBMISSION_MAX_TOTAL_BYTES", async () => {
    const files = [
      makeFile({ sizeBytes: 20 * 1024 * 1024 }),
      makeFile({ sizeBytes: 20 * 1024 * 1024 }),
      makeFile({ sizeBytes: 20 * 1024 * 1024 }),
      makeFile({ sizeBytes: 20 * 1024 * 1024 }),
      makeFile({ sizeBytes: 5 * 1024 * 1024 }),
    ];
    const result = await prepareUpload(files);

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.photos).toMatch(/too large/i);
  });

  it("rejects a single file over SUBMISSION_MAX_FILE_BYTES", async () => {
    const result = await prepareUpload([
      makeFile({ sizeBytes: 21 * 1024 * 1024 }),
    ]);

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.photos).toMatch(/too large/i);
  });

  it("rejects a declared mime type outside the accepted list", async () => {
    const result = await prepareUpload([
      makeFile({ mimeType: "application/pdf" }),
    ]);

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.photos).toMatch(/supported image type/i);
  });

  it("returns ok with no uploads for an empty file list", async () => {
    createUploadTargetsMock.mockResolvedValue([]);
    const result = await prepareUpload([]);

    expect(result.status).toBe("ok");
    expect(result.uploads).toEqual([]);
  });

  it("mints a GPX upload target when a valid GPX file is declared", async () => {
    createUploadTargetsMock
      .mockResolvedValueOnce([
        {
          objectKey: "submissions/2026/01/sub/0-uuid.jpg",
          mimeType: "image/jpeg",
          uploadUrl: "https://example.com/signed-photo",
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
          expiresInSeconds: 300,
        },
      ])
      .mockResolvedValueOnce([
        {
          objectKey: "submissions/2026/01/sub/0-uuid.gpx",
          mimeType: "application/gpx+xml",
          uploadUrl: "https://example.com/signed-gpx",
          method: "PUT",
          headers: { "Content-Type": "application/gpx+xml" },
          expiresInSeconds: 300,
        },
      ]);

    const result = await prepareUpload([makeFile()], {
      originalFilename: "route.gpx",
      sizeBytes: 1024,
    });

    expect(result.status).toBe("ok");
    expect(result.gpxUpload).toMatchObject({
      objectKey: "submissions/2026/01/sub/0-uuid.gpx",
      uploadUrl: "https://example.com/signed-gpx",
    });
    expect(createUploadTargetsMock).toHaveBeenCalledTimes(2);
  });

  it("rejects a declared GPX file without a .gpx extension", async () => {
    const result = await prepareUpload([], {
      originalFilename: "route.txt",
      sizeBytes: 1024,
    });

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.gpxFile).toMatch(/must be a \.gpx file/i);
    expect(createUploadTargetsMock).not.toHaveBeenCalled();
  });

  it("rejects a GPX file over SUBMISSION_MAX_GPX_FILE_BYTES", async () => {
    const result = await prepareUpload([], {
      originalFilename: "route.gpx",
      sizeBytes: 6 * 1024 * 1024,
    });

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.gpxFile).toMatch(/too large/i);
    expect(createUploadTargetsMock).not.toHaveBeenCalled();
  });

  it("succeeds with no gpxUpload when no GPX file is declared", async () => {
    const result = await prepareUpload([makeFile()]);

    expect(result.status).toBe("ok");
    expect(result.gpxUpload).toBeUndefined();
    expect(createUploadTargetsMock).toHaveBeenCalledTimes(1);
  });
});
