# Submission Moderation

Every submission from `/submit` lands as either a server console log
(local development, and production until GitHub Issues is configured)
or a labeled issue in a private GitHub repository. Neither publishes
anything automatically — a human reviews every submission before any
content reaches `content/`.

## Where submissions land

- **Console (default):** logged to the server's stdout. This is the
  dev default and the production fallback until `GITHUB_TOKEN`,
  `GITHUB_OWNER`, and `GITHUB_REPO` are all set — see `.env.example`.
- **GitHub Issues (opt-in):** one issue per submission, labeled
  `submission:new`, in the private repo you configure. The issue body
  is built by `src/lib/submissions/service/format-issue-body.ts` and
  never includes public-facing URLs for the uploaded photos or GPX
  route file — only their private storage object keys.

The backend still supports an optional GPX upload (inherited from the
cycling site this project was forked from), but the public form no longer
shows that field. Remove the GPX code paths from `src/lib/submissions/`
if you never plan to use them.

## Reviewing a submission

For each submission, check:

- **Copyright ownership** — did the contributor confirm they have the
  right to share this story and these photos? (The form requires this
  checkbox; a submission without it never reaches this stage.)
- **Photographer permission** — if a photographer other than the
  contributor is credited, does the story make clear they consented to
  the photos being shared?
- **Personal information** — does the story or photos reveal anything
  the contributor likely didn't intend to make public (home address,
  license plates, minors without context, etc.)?
- **Private trail locations** — does this reveal a locally-protected or
  sensitive trail that shouldn't be published? See the place-profile
  guidance in `docs/content-authoring.md`.
- **Hate symbols or abusive material** — reject anything containing
  these outright.
- **Unsafe or illegal activity presented uncritically** — use
  judgment; celebrating "dumb ideas that somehow worked" is the site's
  whole ethos, but don't publish something that reads as an
  instruction manual for something dangerous.
- **Obvious spam or commercial promotion** — a submission that's
  really just an ad for a shop or product isn't a fit.
- **Image quality** — is at least one photo usable as a hero image at
  roughly 2,000–3,000px on the long edge without looking muddy?
- **Editorial fit** — does this belong on a guitar tone site?

## Outcomes

Label the issue (or note it, if using the console log) to reflect the
decision:

```
submission:new              — just arrived, not yet reviewed
submission:reviewing        — actively being evaluated
submission:accepted         — will be turned into a piece
submission:declined         — not a fit; delete associated media
submission:needs-information — waiting on the contributor
submission:draft-created    — MDX draft exists in a branch
submission:published        — live on the site
```

If accepted, follow `docs/editorial-workflow.md` to turn it into a
published piece.

## Retention and deletion

Declined or otherwise unused raw uploads (photos and any GPX route
file) should be deleted from private storage (local `.local-uploads/`
in dev, the S3 bucket in production) once a decision is made — don't
let rejected submissions accumulate indefinitely. If a contributor
asks for their submission to be deleted, remove the uploaded files,
the GitHub issue (or redact the console record, if that's all that
exists).
