import fs from "node:fs";
import path from "node:path";
import {
  extensionForMimeType,
  isLikelyGpx,
  sniffImageMimeType,
} from "./file-validation";
import { generateObjectKey } from "./object-key";
import type {
  GpxVerificationResult,
  MediaUploadTargetService,
  ObjectVerificationResult,
  UploadTarget,
  UploadTargetRequest,
} from "./types";

// Never inside public/ or content/ — this is unpublished, unreviewed
// contributor material and must not be servable or picked up by the
// content loader.
const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), ".local-uploads");
const SNIFF_RANGE_BYTES = 16;
const GPX_SNIFF_RANGE_BYTES = 512;

/**
 * Dev-only stand-in for S3MediaUploadTargetService. Real presigned URLs
 * require AWS credentials even to generate (no network call needed, but
 * SigV4 signing still needs a credential identity), which a bare local
 * dev environment doesn't have — so instead of a real S3 presigned URL,
 * this hands the browser a URL pointing at the local-only
 * /api/local-uploads/... route, which writes to the same .local-uploads/
 * directory this class then reads back from for verification.
 */
export class LocalMockMediaUploadTargetService implements MediaUploadTargetService {
  async createUploadTargets({
    submissionId,
    files,
  }: UploadTargetRequest): Promise<UploadTarget[]> {
    return files.map((file, index) => {
      const extension = extensionForMimeType(file.mimeType) ?? "bin";
      const objectKey = generateObjectKey(submissionId, index, extension);

      return {
        objectKey,
        mimeType: file.mimeType,
        uploadUrl: `/api/local-uploads/${objectKey}`,
        method: "PUT",
        headers: { "Content-Type": file.mimeType },
        expiresInSeconds: 300,
      };
    });
  }

  async verifyUploadedObject(
    objectKey: string,
  ): Promise<ObjectVerificationResult> {
    const fullPath = path.join(LOCAL_UPLOAD_ROOT, objectKey);
    const fd = fs.openSync(fullPath, "r");
    const buffer = Buffer.alloc(SNIFF_RANGE_BYTES);
    const bytesRead = fs.readSync(fd, buffer, 0, SNIFF_RANGE_BYTES, 0);
    fs.closeSync(fd);

    const sniffedMimeType = sniffImageMimeType(
      new Uint8Array(buffer.subarray(0, bytesRead)),
    );
    const { size } = fs.statSync(fullPath);

    return {
      isValidImage: sniffedMimeType !== null,
      sniffedMimeType,
      actualSizeBytes: size,
    };
  }

  async verifyUploadedGpxFile(
    objectKey: string,
  ): Promise<GpxVerificationResult> {
    const fullPath = path.join(LOCAL_UPLOAD_ROOT, objectKey);
    const fd = fs.openSync(fullPath, "r");
    const buffer = Buffer.alloc(GPX_SNIFF_RANGE_BYTES);
    const bytesRead = fs.readSync(fd, buffer, 0, GPX_SNIFF_RANGE_BYTES, 0);
    fs.closeSync(fd);

    const { size } = fs.statSync(fullPath);

    return {
      isValidGpx: isLikelyGpx(new Uint8Array(buffer.subarray(0, bytesRead))),
      actualSizeBytes: size,
    };
  }

  async deleteObject(objectKey: string): Promise<void> {
    const fullPath = path.join(LOCAL_UPLOAD_ROOT, objectKey);
    fs.rmSync(fullPath, { force: true });
  }
}
