import { EmailSubmissionNotificationService } from "./email";
import { NoopSubmissionNotificationService } from "./noop";
import type { SubmissionNotificationService } from "./types";

export type {
  SubmissionNotification,
  SubmissionNotificationService,
} from "./types";

let cached: SubmissionNotificationService | null = null;

export function getSubmissionNotificationService(): SubmissionNotificationService {
  if (cached) return cached;

  const apiKey = process.env.RESEND_API_KEY;
  const toAddress = process.env.SUBMISSION_NOTIFICATION_EMAIL;

  cached =
    apiKey && toAddress
      ? new EmailSubmissionNotificationService(apiKey, toAddress)
      : new NoopSubmissionNotificationService();

  return cached;
}
