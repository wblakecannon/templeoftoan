"use server";

import {
  ACCEPTED_IMAGE_MIME_TYPES,
  GPX_MIME_TYPE,
  SUBMISSION_MAX_FILES,
  SUBMISSION_MAX_FILE_BYTES,
  SUBMISSION_MAX_GPX_FILE_BYTES,
  SUBMISSION_MAX_TOTAL_BYTES,
} from "./schema";
import { getMediaUploadTargetService } from "./upload";
import { generateSubmissionId } from "./upload/object-key";
import { RateLimiter } from "./rate-limit";
import { getClientKey } from "./client-key";

// Looser than the submit-completion limiter: minting an upload URL is
// cheap (a local SigV4 signing operation, no bytes moved yet), but still
// rate-limited so it can't be hammered for free.
const rateLimiter = new RateLimiter(20, 10 * 60 * 1000);

export interface DeclaredFile {
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface PreparedUpload {
  objectKey: string;
  mimeType: string;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
}

export interface DeclaredGpxFile {
  originalFilename: string;
  sizeBytes: number;
}

export interface PrepareUploadResult {
  status: "ok" | "error";
  submissionId?: string;
  uploads?: PreparedUpload[];
  gpxUpload?: PreparedUpload;
  fieldErrors?: Record<string, string>;
}

export async function prepareUpload(
  declaredFiles: DeclaredFile[],
  declaredGpxFile?: DeclaredGpxFile,
): Promise<PrepareUploadResult> {
  const clientKey = await getClientKey();
  if (!rateLimiter.check(clientKey, Date.now())) {
    return {
      status: "error",
      fieldErrors: {
        photos: "Too many uploads from this connection. Try again later.",
      },
    };
  }

  if (declaredFiles.length > SUBMISSION_MAX_FILES) {
    return {
      status: "error",
      fieldErrors: { photos: `Attach at most ${SUBMISSION_MAX_FILES} photos.` },
    };
  }

  const totalBytes = declaredFiles.reduce((sum, f) => sum + f.sizeBytes, 0);
  if (totalBytes > SUBMISSION_MAX_TOTAL_BYTES) {
    return {
      status: "error",
      fieldErrors: { photos: "Total photo size is too large." },
    };
  }

  for (const file of declaredFiles) {
    if (file.sizeBytes > SUBMISSION_MAX_FILE_BYTES) {
      return {
        status: "error",
        fieldErrors: { photos: `"${file.originalFilename}" is too large.` },
      };
    }
    if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.mimeType as never)) {
      return {
        status: "error",
        fieldErrors: {
          photos: `"${file.originalFilename}" isn't a supported image type (JPEG, PNG, or WebP only).`,
        },
      };
    }
  }

  if (declaredGpxFile) {
    if (!declaredGpxFile.originalFilename.toLowerCase().endsWith(".gpx")) {
      return {
        status: "error",
        fieldErrors: {
          gpxFile: `"${declaredGpxFile.originalFilename}" must be a .gpx file.`,
        },
      };
    }
    if (declaredGpxFile.sizeBytes > SUBMISSION_MAX_GPX_FILE_BYTES) {
      return {
        status: "error",
        fieldErrors: {
          gpxFile: `"${declaredGpxFile.originalFilename}" is too large.`,
        },
      };
    }
  }

  const submissionId = generateSubmissionId();
  const uploadTargetService = getMediaUploadTargetService();

  const targets = await uploadTargetService.createUploadTargets({
    submissionId,
    files: declaredFiles.map((f) => ({
      originalFilename: f.originalFilename,
      mimeType: f.mimeType,
      declaredSizeBytes: f.sizeBytes,
    })),
  });

  let gpxTarget: PreparedUpload | undefined;
  if (declaredGpxFile) {
    const [gpx] = await uploadTargetService.createUploadTargets({
      submissionId,
      files: [
        {
          originalFilename: declaredGpxFile.originalFilename,
          mimeType: GPX_MIME_TYPE,
          declaredSizeBytes: declaredGpxFile.sizeBytes,
        },
      ],
    });
    gpxTarget = {
      objectKey: gpx.objectKey,
      mimeType: gpx.mimeType,
      uploadUrl: gpx.uploadUrl,
      method: gpx.method,
      headers: gpx.headers,
    };
  }

  return {
    status: "ok",
    submissionId,
    uploads: targets.map((t) => ({
      objectKey: t.objectKey,
      mimeType: t.mimeType,
      uploadUrl: t.uploadUrl,
      method: t.method,
      headers: t.headers,
    })),
    gpxUpload: gpxTarget,
  };
}
