import type { ValidatedSubmission } from "../schema";
import type { UploadedMedia } from "../upload/types";

export interface SubmissionResult {
  submissionId: string;
  reference: string;
}

export interface SubmissionService {
  createSubmission(
    input: ValidatedSubmission,
    media: UploadedMedia[],
    gpxFile?: UploadedMedia,
  ): Promise<SubmissionResult>;
}
