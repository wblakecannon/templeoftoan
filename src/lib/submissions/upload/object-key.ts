import { randomUUID } from "node:crypto";

/**
 * Server-controlled object key — never derived from the original
 * filename, which could contain path traversal sequences, unsafe
 * characters, or leak information about the contributor's device.
 */
export function generateObjectKey(
  submissionId: string,
  index: number,
  extension: string,
): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `submissions/${year}/${month}/${submissionId}/${index}-${randomUUID()}.${extension}`;
}

export function generateSubmissionId(): string {
  return randomUUID();
}
