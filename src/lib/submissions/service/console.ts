import { formatIssueBody } from "./format-issue-body";
import type { SubmissionResult, SubmissionService } from "./types";
import type { ValidatedSubmission } from "../schema";
import type { UploadedMedia } from "../upload/types";

export class ConsoleSubmissionService implements SubmissionService {
  async createSubmission(
    input: ValidatedSubmission,
    media: UploadedMedia[],
    gpxFile?: UploadedMedia,
  ): Promise<SubmissionResult> {
    console.log(
      `\n--- New submission ${input.submissionId} ---\n${formatIssueBody(input, media, gpxFile)}\n--- end submission ---\n`,
    );

    return {
      submissionId: input.submissionId,
      reference: `console:${input.submissionId}`,
    };
  }
}
