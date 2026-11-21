import { Resend } from "resend";
import type {
  SubmissionNotification,
  SubmissionNotificationService,
} from "./types";

export class EmailSubmissionNotificationService implements SubmissionNotificationService {
  private readonly resend: Resend;
  private readonly toAddress: string;

  constructor(apiKey: string, toAddress: string) {
    this.resend = new Resend(apiKey);
    this.toAddress = toAddress;
  }

  async notifyCreated(input: SubmissionNotification): Promise<void> {
    // Best-effort only — a failure here must never fail the submission,
    // since the GitHub issue (or console log) is the real record.
    try {
      await this.resend.emails.send({
        from: "Temple of Toan <notifications@templeoftoan.com>",
        to: this.toAddress,
        subject: `New submission: ${input.submissionType} from ${input.contributorName}`,
        text: `Submission ID: ${input.submissionId}\nType: ${input.submissionType}\nFrom: ${input.contributorName}\nReview: ${input.reference}`,
      });
    } catch (error) {
      console.error("Submission email notification failed:", error);
    }
  }
}
