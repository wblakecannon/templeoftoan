import { z } from "zod";

export const SUBMISSION_TYPES = [
  "relic",
  "rig",
  "disciple",
  "sermon",
  "tech",
  "other",
] as const;
export type SubmissionType = (typeof SUBMISSION_TYPES)[number];

export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const SUBMISSION_MAX_FILES = Number(
  process.env.SUBMISSION_MAX_FILES ?? 6,
);
export const SUBMISSION_MAX_FILE_BYTES = Number(
  process.env.SUBMISSION_MAX_FILE_BYTES ?? 20 * 1024 * 1024,
);
export const SUBMISSION_MAX_TOTAL_BYTES = Number(
  process.env.SUBMISSION_MAX_TOTAL_BYTES ?? 80 * 1024 * 1024,
);
export const SUBMISSION_MAX_GPX_FILE_BYTES = Number(
  process.env.SUBMISSION_MAX_GPX_FILE_BYTES ?? 5 * 1024 * 1024,
);
export const GPX_MIME_TYPE = "application/gpx+xml";

// The public form field is never sent to the server — it's a honeypot.
// Any non-empty value here is treated as a bot submission.
export const submissionFormSchema = z.object({
  contributorName: z.string().min(1, "Name is required").max(200),
  contributorEmail: z.email("Enter a valid email address"),
  contributorUrl: z.url().optional().or(z.literal("")),
  submissionType: z.enum(SUBMISSION_TYPES),
  proposedTitle: z.string().max(200).optional().or(z.literal("")),
  story: z.string().min(1, "Tell us a little about it").max(10_000),
  location: z.string().max(200).optional().or(z.literal("")),
  gearManufacturer: z.string().max(200).optional().or(z.literal("")),
  gearModel: z.string().max(200).optional().or(z.literal("")),
  gearSettings: z.string().max(50).optional().or(z.literal("")),
  photographerCredit: z.string().max(200).optional().or(z.literal("")),
  rightsConfirmed: z.literal(true, {
    error: "You must confirm you have the right to share these photos",
  }),
  editingPermission: z.literal(true, {
    error: "You must allow editing for clarity and presentation",
  }),
  // Generic message deliberately doesn't reveal that this is a honeypot
  // check — a bot smart enough to read validation errors shouldn't learn
  // which field tripped it.
  honeypot: z.literal("", { error: "This submission couldn't be processed." }),
});

export type SubmissionFormInput = z.infer<typeof submissionFormSchema>;

export interface ValidatedSubmission extends SubmissionFormInput {
  submissionId: string;
  receivedAt: string;
}
