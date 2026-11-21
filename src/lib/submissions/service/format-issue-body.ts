import type { ValidatedSubmission } from "../schema";
import type { UploadedMedia } from "../upload/types";

function line(label: string, value?: string): string {
  return value ? `**${label}:** ${value}` : "";
}

/**
 * Builds the moderation record body shared by every SubmissionService
 * adapter. Never includes raw Blob/S3 URLs — only object keys, so a
 * reader with repo access still can't fetch the private files without
 * separately-scoped storage credentials.
 */
export function formatIssueBody(
  submission: ValidatedSubmission,
  media: UploadedMedia[],
  gpxFile?: UploadedMedia,
): string {
  const sections = [
    line("Submission ID", submission.submissionId),
    line("Received", submission.receivedAt),
    line("Contributor name", submission.contributorName),
    line("Contributor email", submission.contributorEmail),
    line("Contributor URL", submission.contributorUrl),
    line("Submission type", submission.submissionType),
    line("Proposed title", submission.proposedTitle),
    line("Location", submission.location),
    line("Gear manufacturer", submission.gearManufacturer),
    line("Gear model", submission.gearModel),
    line("Settings", submission.gearSettings),
    line("Photographer credit", submission.photographerCredit),
    line("Rights confirmed", submission.rightsConfirmed ? "Yes" : "No"),
    line(
      "Editing permission granted",
      submission.editingPermission ? "Yes" : "No",
    ),
    "",
    "**Story:**",
    submission.story,
    "",
    "**Photos (private object keys, not public URLs):**",
    media.length > 0
      ? media
          .map(
            (m) => `- \`${m.objectKey}\` (${m.mimeType}, ${m.sizeBytes} bytes)`,
          )
          .join("\n")
      : "_No photos attached._",
    "",
    "**Route file (GPX, private object key):**",
    gpxFile
      ? `- \`${gpxFile.objectKey}\` (${gpxFile.sizeBytes} bytes)`
      : "_None attached._",
  ];

  return sections.filter((s) => s !== "").join("\n");
}
