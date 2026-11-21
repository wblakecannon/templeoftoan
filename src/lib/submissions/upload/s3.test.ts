import { describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();
const getSignedUrlMock = vi
  .fn()
  .mockResolvedValue("https://example-bucket.s3.amazonaws.com/signed");

vi.mock("@aws-sdk/client-s3", () => {
  class PutObjectCommand {
    input: Record<string, unknown>;
    constructor(input: Record<string, unknown>) {
      this.input = input;
    }
  }
  class GetObjectCommand {
    input: Record<string, unknown>;
    constructor(input: Record<string, unknown>) {
      this.input = input;
    }
  }
  class HeadObjectCommand {
    input: Record<string, unknown>;
    constructor(input: Record<string, unknown>) {
      this.input = input;
    }
  }
  class DeleteObjectCommand {
    input: Record<string, unknown>;
    constructor(input: Record<string, unknown>) {
      this.input = input;
    }
  }
  class S3Client {
    send = sendMock;
  }
  return {
    PutObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    DeleteObjectCommand,
    S3Client,
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: getSignedUrlMock,
}));

const { S3MediaUploadTargetService } = await import("./s3");

describe("S3MediaUploadTargetService.createUploadTargets", () => {
  it("signs a PutObjectCommand with bucket, key, content type, and content length — never an ACL", async () => {
    getSignedUrlMock.mockClear();
    const service = new S3MediaUploadTargetService("test-bucket", "us-west-2");

    const targets = await service.createUploadTargets({
      submissionId: "sub-123",
      files: [
        {
          originalFilename: "photo.jpg",
          mimeType: "image/jpeg",
          declaredSizeBytes: 12345,
        },
      ],
    });

    expect(getSignedUrlMock).toHaveBeenCalledTimes(1);
    const [, command] = getSignedUrlMock.mock.calls[0];
    expect(command.input).toMatchObject({
      Bucket: "test-bucket",
      ContentType: "image/jpeg",
      ContentLength: 12345,
    });
    expect(command.input.Key).toContain("submissions/");
    expect(command.input).not.toHaveProperty("ACL");

    expect(targets).toHaveLength(1);
    expect(targets[0]).toMatchObject({
      mimeType: "image/jpeg",
      uploadUrl: "https://example-bucket.s3.amazonaws.com/signed",
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
    });
  });

  it("mints one target per declared file", async () => {
    getSignedUrlMock.mockClear();
    const service = new S3MediaUploadTargetService("test-bucket", "us-west-2");

    const targets = await service.createUploadTargets({
      submissionId: "sub-456",
      files: [
        {
          originalFilename: "a.jpg",
          mimeType: "image/jpeg",
          declaredSizeBytes: 100,
        },
        {
          originalFilename: "b.png",
          mimeType: "image/png",
          declaredSizeBytes: 200,
        },
      ],
    });

    expect(getSignedUrlMock).toHaveBeenCalledTimes(2);
    expect(targets).toHaveLength(2);
    expect(new Set(targets.map((t) => t.objectKey)).size).toBe(2);
  });
});

describe("S3MediaUploadTargetService.verifyUploadedObject", () => {
  it("reports a valid image when the sniffed bytes match a known signature", async () => {
    sendMock.mockReset();
    sendMock.mockImplementation(
      (command: { input: Record<string, unknown> }) => {
        if ("Range" in command.input) {
          return Promise.resolve({
            Body: {
              transformToByteArray: async () =>
                new Uint8Array([
                  0xff, 0xd8, 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                ]),
            },
          });
        }
        return Promise.resolve({ ContentLength: 4096 });
      },
    );

    const service = new S3MediaUploadTargetService("test-bucket", "us-west-2");
    const result = await service.verifyUploadedObject(
      "submissions/2026/01/sub/0-uuid.jpg",
    );

    expect(result).toEqual({
      isValidImage: true,
      sniffedMimeType: "image/jpeg",
      actualSizeBytes: 4096,
    });
  });

  it("reports an invalid image when the bytes don't match any known signature", async () => {
    sendMock.mockReset();
    sendMock.mockImplementation(
      (command: { input: Record<string, unknown> }) => {
        if ("Range" in command.input) {
          return Promise.resolve({
            Body: {
              transformToByteArray: async () => new Uint8Array(16).fill(0),
            },
          });
        }
        return Promise.resolve({ ContentLength: 4096 });
      },
    );

    const service = new S3MediaUploadTargetService("test-bucket", "us-west-2");
    const result = await service.verifyUploadedObject(
      "submissions/2026/01/sub/0-uuid.jpg",
    );

    expect(result.isValidImage).toBe(false);
    expect(result.sniffedMimeType).toBeNull();
  });
});

describe("S3MediaUploadTargetService.verifyUploadedGpxFile", () => {
  it("reports valid GPX content", async () => {
    sendMock.mockReset();
    sendMock.mockImplementation(
      (command: { input: Record<string, unknown> }) => {
        if ("Range" in command.input) {
          return Promise.resolve({
            Body: {
              transformToByteArray: async () =>
                new TextEncoder().encode("<gpx><trk></trk></gpx>"),
            },
          });
        }
        return Promise.resolve({ ContentLength: 512 });
      },
    );

    const service = new S3MediaUploadTargetService("test-bucket", "us-west-2");
    const result = await service.verifyUploadedGpxFile(
      "submissions/2026/01/sub/0-uuid.gpx",
    );

    expect(result).toEqual({ isValidGpx: true, actualSizeBytes: 512 });
  });

  it("reports invalid for non-GPX content", async () => {
    sendMock.mockReset();
    sendMock.mockImplementation(
      (command: { input: Record<string, unknown> }) => {
        if ("Range" in command.input) {
          return Promise.resolve({
            Body: {
              transformToByteArray: async () =>
                new TextEncoder().encode("not gpx"),
            },
          });
        }
        return Promise.resolve({ ContentLength: 7 });
      },
    );

    const service = new S3MediaUploadTargetService("test-bucket", "us-west-2");
    const result = await service.verifyUploadedGpxFile(
      "submissions/2026/01/sub/0-uuid.gpx",
    );

    expect(result.isValidGpx).toBe(false);
  });
});

describe("S3MediaUploadTargetService.deleteObject", () => {
  it("sends a DeleteObjectCommand for the given key", async () => {
    sendMock.mockReset().mockResolvedValue({});
    const service = new S3MediaUploadTargetService("test-bucket", "us-west-2");

    await service.deleteObject("submissions/2026/01/sub/0-uuid.jpg");

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0].input).toMatchObject({
      Bucket: "test-bucket",
      Key: "submissions/2026/01/sub/0-uuid.jpg",
    });
  });
});
