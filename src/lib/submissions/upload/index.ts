import { LocalMockMediaUploadTargetService } from "./local-mock";
import { S3MediaUploadTargetService } from "./s3";
import type { MediaUploadTargetService } from "./types";

export type {
  MediaUploadTargetService,
  UploadedMedia,
  UploadTarget,
  UploadTargetRequest,
  DeclaredFile,
  ObjectVerificationResult,
  GpxVerificationResult,
} from "./types";

let cached: MediaUploadTargetService | null = null;

/**
 * S3 is used only when SUBMISSION_MEDIA_BUCKET is set; otherwise every
 * environment (including production, until the bucket is provisioned)
 * safely falls back to local disk rather than throwing.
 *
 * Region comes from SUBMISSION_MEDIA_BUCKET_REGION, not AWS_REGION —
 * AWS_-prefixed variables are reserved by the hosting platform (Lambda
 * injects its own AWS_REGION at runtime, and Amplify refuses to let you
 * override it), so this app defines its own name instead of fighting
 * that. The us-west-2 default matches where both buckets actually live.
 */
export function getMediaUploadTargetService(): MediaUploadTargetService {
  if (cached) return cached;

  const bucket = process.env.SUBMISSION_MEDIA_BUCKET;
  cached = bucket
    ? new S3MediaUploadTargetService(
        bucket,
        process.env.SUBMISSION_MEDIA_BUCKET_REGION ?? "us-west-2",
      )
    : new LocalMockMediaUploadTargetService();

  return cached;
}
