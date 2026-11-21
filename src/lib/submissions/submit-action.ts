"use server";

import { submissionFormSchema, type ValidatedSubmission } from "./schema";
import { getMediaUploadTargetService } from "./upload";
import type { UploadedMedia } from "./upload/types";
import { getSubmissionService } from "./service";
import { getSubmissionNotificationService } from "./notify";
import { RateLimiter } from "./rate-limit";
import { getClientKey } from "./client-key";

const rateLimiter = new RateLimiter(5, 10 * 60 * 1000);

export interface SubmitActionResult {
  status: "success" | "error";
  fieldErrors?: Record<string, string>;
  formError?: string;
}

interface ClaimedMedia {
  objectKey: string;
  mimeType: string;
  sizeBytes: number;
  originalFilename: string;
}

function parseClaimedMedia(raw: unknown): ClaimedMedia[] | null {
  if (typeof raw !== "string" || raw === "") return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    for (const item of parsed) {
      if (
        typeof item !== "object" ||
        item === null ||
        typeof item.objectKey !== "string" ||
        typeof item.mimeType !== "string" ||
        typeof item.sizeBytes !== "number" ||
        typeof item.originalFilename !== "string"
      ) {
        return null;
      }
    }
    return parsed as ClaimedMedia[];
  } catch {
    return null;
  }
}

function parseClaimedGpx(raw: unknown): ClaimedMedia | null | undefined {
  if (typeof raw !== "string" || raw === "") return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.objectKey !== "string" ||
      typeof parsed.mimeType !== "string" ||
      typeof parsed.sizeBytes !== "number" ||
      typeof parsed.originalFilename !== "string"
    ) {
      return null;
    }
    return parsed as ClaimedMedia;
  } catch {
    return null;
  }
}

export async function submitContribution(
  formData: FormData,
): Promise<SubmitActionResult> {
  const clientKey = await getClientKey();
  if (!rateLimiter.check(clientKey, Date.now())) {
    return {
      status: "error",
      formError: "Too many submissions from this connection. Try again later.",
    };
  }

  const rawFields = {
    contributorName: formData.get("contributorName"),
    contributorEmail: formData.get("contributorEmail"),
    contributorUrl: formData.get("contributorUrl"),
    submissionType: formData.get("submissionType"),
    proposedTitle: formData.get("proposedTitle"),
    story: formData.get("story"),
    location: formData.get("location"),
    gearManufacturer: formData.get("gearManufacturer"),
    gearModel: formData.get("gearModel"),
    gearSettings: formData.get("gearSettings"),
    photographerCredit: formData.get("photographerCredit"),
    rightsConfirmed: formData.get("rightsConfirmed") === "on",
    editingPermission: formData.get("editingPermission") === "on",
    honeypot: formData.get("website") ?? "",
  };

  const parsed = submissionFormSchema.safeParse(rawFields);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fieldErrors[field] = issue.message;
    }
    // A non-empty honeypot fails validation like any other field, so the
    // bot sees a generic validation error rather than a tell that it
    // was specifically detected.
    return { status: "error", fieldErrors };
  }

  const submissionId = formData.get("submissionId");
  if (typeof submissionId !== "string" || submissionId === "") {
    return {
      status: "error",
      formError: "Something went wrong. Please try again.",
    };
  }

  const claimedMedia = parseClaimedMedia(formData.get("uploadedMedia"));
  if (claimedMedia === null) {
    return {
      status: "error",
      formError: "Something went wrong. Please try again.",
    };
  }

  const claimedGpx = parseClaimedGpx(formData.get("uploadedGpx"));
  if (claimedGpx === null) {
    return {
      status: "error",
      formError: "Something went wrong. Please try again.",
    };
  }

  // Photo bytes already live in S3/local disk by this point (uploaded
  // directly by the browser via prepareUpload's presigned targets — see
  // upload-action.ts). The server never received the raw bytes in this
  // request, so it re-verifies each object's real content here instead
  // of trusting the client's claimed mimeType/sizeBytes.
  const uploadTargetService = getMediaUploadTargetService();
  const verifiedMedia: UploadedMedia[] = [];

  for (const claim of claimedMedia) {
    let verification;
    try {
      verification = await uploadTargetService.verifyUploadedObject(
        claim.objectKey,
      );
    } catch {
      return {
        status: "error",
        fieldErrors: {
          photos: `"${claim.originalFilename}" couldn't be found. Please try again.`,
        },
      };
    }

    if (!verification.isValidImage) {
      await uploadTargetService.deleteObject(claim.objectKey).catch(() => {});
      return {
        status: "error",
        fieldErrors: {
          photos: `"${claim.originalFilename}" isn't a supported image type (JPEG, PNG, or WebP only).`,
        },
      };
    }

    verifiedMedia.push({
      objectKey: claim.objectKey,
      mimeType: verification.sniffedMimeType!,
      sizeBytes: verification.actualSizeBytes,
      originalFilename: claim.originalFilename,
    });
  }

  let verifiedGpx: UploadedMedia | undefined;
  if (claimedGpx) {
    let gpxVerification;
    try {
      gpxVerification = await uploadTargetService.verifyUploadedGpxFile(
        claimedGpx.objectKey,
      );
    } catch {
      return {
        status: "error",
        fieldErrors: {
          gpxFile: `"${claimedGpx.originalFilename}" couldn't be found. Please try again.`,
        },
      };
    }

    if (!gpxVerification.isValidGpx) {
      await uploadTargetService
        .deleteObject(claimedGpx.objectKey)
        .catch(() => {});
      return {
        status: "error",
        fieldErrors: {
          gpxFile: `"${claimedGpx.originalFilename}" isn't a valid GPX file.`,
        },
      };
    }

    verifiedGpx = {
      objectKey: claimedGpx.objectKey,
      mimeType: claimedGpx.mimeType,
      sizeBytes: gpxVerification.actualSizeBytes,
      originalFilename: claimedGpx.originalFilename,
    };
  }

  // Defensive re-check immediately before committing: closes the (small
  // but real) gap between the per-file verification above and creating
  // the submission record. If an object that verified successfully
  // moments ago is gone by now, fail loudly here — before any GitHub
  // issue or notification exists — rather than silently succeeding with
  // a submission record that points at nothing.
  for (const media of verifiedMedia) {
    try {
      await uploadTargetService.verifyUploadedObject(media.objectKey);
    } catch {
      return {
        status: "error",
        fieldErrors: {
          photos: `"${media.originalFilename}" is no longer available. Please try again.`,
        },
      };
    }
  }

  if (verifiedGpx) {
    try {
      await uploadTargetService.verifyUploadedGpxFile(verifiedGpx.objectKey);
    } catch {
      return {
        status: "error",
        fieldErrors: {
          gpxFile: `"${verifiedGpx.originalFilename}" is no longer available. Please try again.`,
        },
      };
    }
  }

  const submission: ValidatedSubmission = {
    ...parsed.data,
    submissionId,
    receivedAt: new Date().toISOString(),
  };

  const result = await getSubmissionService().createSubmission(
    submission,
    verifiedMedia,
    verifiedGpx,
  );

  await getSubmissionNotificationService().notifyCreated({
    submissionId: result.submissionId,
    contributorName: submission.contributorName,
    submissionType: submission.submissionType,
    reference: result.reference,
  });

  return { status: "success" };
}
