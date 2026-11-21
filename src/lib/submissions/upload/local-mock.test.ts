import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocalMockMediaUploadTargetService } from "./local-mock";

const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), ".local-uploads");

describe("LocalMockMediaUploadTargetService", () => {
  const service = new LocalMockMediaUploadTargetService();
  let testDir: string;

  beforeEach(() => {
    testDir = path.join(LOCAL_UPLOAD_ROOT, "submissions", "__test__");
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it("createUploadTargets returns a local API route URL per file", async () => {
    const targets = await service.createUploadTargets({
      submissionId: "sub-123",
      files: [
        {
          originalFilename: "photo.jpg",
          mimeType: "image/jpeg",
          declaredSizeBytes: 1024,
        },
      ],
    });

    expect(targets).toHaveLength(1);
    expect(targets[0].uploadUrl).toMatch(
      /^\/api\/local-uploads\/submissions\//,
    );
    expect(targets[0].method).toBe("PUT");
    expect(targets[0].headers["Content-Type"]).toBe("image/jpeg");
  });

  it("verifyUploadedObject sniffs a real image written to disk", async () => {
    const objectKey = "submissions/__test__/0-uuid.jpg";
    const fullPath = path.join(LOCAL_UPLOAD_ROOT, objectKey);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(
      fullPath,
      Buffer.from([
        0xff, 0xd8, 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2,
      ]),
    );

    const result = await service.verifyUploadedObject(objectKey);

    expect(result.isValidImage).toBe(true);
    expect(result.sniffedMimeType).toBe("image/jpeg");
    expect(result.actualSizeBytes).toBe(18);
  });

  it("verifyUploadedObject reports invalid for non-image content", async () => {
    const objectKey = "submissions/__test__/1-uuid.jpg";
    const fullPath = path.join(LOCAL_UPLOAD_ROOT, objectKey);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, Buffer.from("not an image at all"));

    const result = await service.verifyUploadedObject(objectKey);

    expect(result.isValidImage).toBe(false);
    expect(result.sniffedMimeType).toBeNull();
  });

  it("verifyUploadedGpxFile sniffs real GPX content written to disk", async () => {
    const objectKey = "submissions/__test__/0-uuid.gpx";
    const fullPath = path.join(LOCAL_UPLOAD_ROOT, objectKey);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, Buffer.from("<gpx><trk></trk></gpx>"));

    const result = await service.verifyUploadedGpxFile(objectKey);

    expect(result.isValidGpx).toBe(true);
    expect(result.actualSizeBytes).toBe(22);
  });

  it("verifyUploadedGpxFile reports invalid for non-GPX content", async () => {
    const objectKey = "submissions/__test__/1-uuid.gpx";
    const fullPath = path.join(LOCAL_UPLOAD_ROOT, objectKey);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, Buffer.from("not a gpx file"));

    const result = await service.verifyUploadedGpxFile(objectKey);

    expect(result.isValidGpx).toBe(false);
  });

  it("deleteObject removes the file from disk", async () => {
    const objectKey = "submissions/__test__/2-uuid.jpg";
    const fullPath = path.join(LOCAL_UPLOAD_ROOT, objectKey);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, Buffer.from([0xff, 0xd8, 0xff]));

    await service.deleteObject(objectKey);

    expect(fs.existsSync(fullPath)).toBe(false);
  });

  it("deleteObject does not throw when the file doesn't exist", async () => {
    await expect(
      service.deleteObject("submissions/__test__/missing.jpg"),
    ).resolves.toBeUndefined();
  });
});
