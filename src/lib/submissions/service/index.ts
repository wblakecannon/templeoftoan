import { ConsoleSubmissionService } from "./console";
import { GitHubIssueSubmissionService } from "./github-issue";
import type { SubmissionService } from "./types";

export type { SubmissionResult, SubmissionService } from "./types";

let cached: SubmissionService | null = null;

/**
 * GitHub Issues is used only when GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPO
 * are all set; otherwise every environment (including production,
 * until those are configured) safely falls back to logging submissions
 * to the server console rather than throwing or silently dropping them.
 */
export function getSubmissionService(): SubmissionService {
  if (cached) return cached;

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const label = process.env.GITHUB_SUBMISSION_LABEL ?? "submission:new";

  cached =
    token && owner && repo
      ? new GitHubIssueSubmissionService({ token, owner, repo, label })
      : new ConsoleSubmissionService();

  return cached;
}
