export interface SubmissionNotification {
  submissionId: string;
  contributorName: string;
  submissionType: string;
  reference: string;
}

export interface SubmissionNotificationService {
  notifyCreated(input: SubmissionNotification): Promise<void>;
}
