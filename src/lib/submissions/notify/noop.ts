import type { SubmissionNotificationService } from "./types";

export class NoopSubmissionNotificationService implements SubmissionNotificationService {
  // Intentionally does nothing — email notification is optional and
  // never authoritative. GitHub Issues (or the console log) is.
  async notifyCreated(): Promise<void> {}
}
