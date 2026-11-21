import { Octokit } from "@octokit/rest";
import { formatIssueBody } from "./format-issue-body";
import type { SubmissionResult, SubmissionService } from "./types";
import type { ValidatedSubmission } from "../schema";
import type { UploadedMedia } from "../upload/types";

export interface GitHubIssueSubmissionServiceOptions {
  token: string;
  owner: string;
  repo: string;
  label: string;
}

/**
 * Creates issues only in the configured private repository. The
 * repository's privacy is the operator's responsibility to set up —
 * this adapter does not verify it, since GitHub's API doesn't expose
 * that check cheaply per-request. Never call this with a token scoped
 * beyond issue creation on that one repo.
 */
export class GitHubIssueSubmissionService implements SubmissionService {
  private readonly octokit: Octokit;
  private readonly owner: string;
  private readonly repo: string;
  private readonly label: string;

  constructor({
    token,
    owner,
    repo,
    label,
  }: GitHubIssueSubmissionServiceOptions) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
    this.label = label;
  }

  async createSubmission(
    input: ValidatedSubmission,
    media: UploadedMedia[],
    gpxFile?: UploadedMedia,
  ): Promise<SubmissionResult> {
    const title = `[${input.submissionType}] ${input.proposedTitle || input.contributorName}`;

    const { data } = await this.octokit.issues.create({
      owner: this.owner,
      repo: this.repo,
      title,
      body: formatIssueBody(input, media, gpxFile),
      labels: [this.label],
    });

    return { submissionId: input.submissionId, reference: data.html_url };
  }
}
