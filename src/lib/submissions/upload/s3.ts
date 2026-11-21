import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

const PRESIGN_EXPIRY_SECONDS = 300;

// Enough bytes to cover every magic-byte check in file-validation.ts
// (the WebP check reads up through byte index 11).
const SNIFF_RANGE_BYTES = 16;

// Enough to get past a BOM/XML declaration and any XML comments/leading
// whitespace to the actual <gpx> root element on real-world files.
const GPX_SNIFF_RANGE_BYTES = 512;

export class S3MediaUploadTargetService implements MediaUploadTargetService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(bucket: string, region: string) {
    this.bucket = bucket;
    this.client = new S3Client({ region });
  }

  async createUploadTargets({
    submissionId,
    files,
  }: UploadTargetRequest): Promise<UploadTarget[]> {
    const targets: UploadTarget[] = [];

    for (const [index, file] of files.entries()) {
      const extension = extensionForMimeType(file.mimeType) ?? "bin";
      const objectKey = generateObjectKey(submissionId, index, extension);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        ContentType: file.mimeType,
        ContentLength: file.declaredSizeBytes,
        // No ACL: the target buckets use Object Ownership =
        // BucketOwnerEnforced, which disables ACLs entirely — S3
        // rejects any request that specifies one. Privacy is enforced
        // by the bucket's public access block and IAM policy instead.
      });

      const uploadUrl = await getSignedUrl(this.client, command, {
        expiresIn: PRESIGN_EXPIRY_SECONDS,
      });

      targets.push({
        objectKey,
        mimeType: file.mimeType,
        uploadUrl,
        method: "PUT",
        headers: { "Content-Type": file.mimeType },
        expiresInSeconds: PRESIGN_EXPIRY_SECONDS,
      });
    }

    return targets;
  }

  async verifyUploadedObject(
    objectKey: string,
  ): Promise<ObjectVerificationResult> {
    const [rangeResult, headResult] = await Promise.all([
      this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: objectKey,
          Range: `bytes=0-${SNIFF_RANGE_BYTES - 1}`,
        }),
      ),
      this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      ),
    ]);

    const bytes = await rangeResult.Body!.transformToByteArray();
    const sniffedMimeType = sniffImageMimeType(bytes);

    return {
      isValidImage: sniffedMimeType !== null,
      sniffedMimeType,
      actualSizeBytes: headResult.ContentLength ?? 0,
    };
  }

  async verifyUploadedGpxFile(
    objectKey: string,
  ): Promise<GpxVerificationResult> {
    const [rangeResult, headResult] = await Promise.all([
      this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: objectKey,
          Range: `bytes=0-${GPX_SNIFF_RANGE_BYTES - 1}`,
        }),
      ),
      this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      ),
    ]);

    const bytes = await rangeResult.Body!.transformToByteArray();

    return {
      isValidGpx: isLikelyGpx(bytes),
      actualSizeBytes: headResult.ContentLength ?? 0,
    };
  }

  async deleteObject(objectKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: objectKey }),
    );
  }
}
