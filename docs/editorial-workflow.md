# Editorial Workflow

This is the path from a public submission to a published piece. Git
and MDX remain the source of truth throughout — nothing here writes to
`content/` automatically.

1. A contributor submits through `/submit`.
2. The submission becomes a private GitHub issue (or a console log
   locally / before GitHub Issues is configured) labeled
   `submission:new`. Raw photos go to private storage — see
   `docs/submission-moderation.md`.
3. Review the submission against the checklist in
   `docs/submission-moderation.md`. Move it to `submission:reviewing`.
4. Decide: accept, decline, or request more information
   (`submission:needs-information`). If declined, delete the raw
   uploads and label `submission:declined`.
5. If accepted (`submission:accepted`), copy the matching template from
   `content/templates/` into `content/editorial/` (or
   `content/collections/`) — see `docs/content-authoring.md`.
6. Turn the submission into MDX body copy. It's fine — expected,
   even — to edit for clarity and presentation; the contributor agreed
   to this when submitting.
7. Select the best 1–4 photos from the private upload. Export/compress
   them to roughly 2,000–3,000px on the long edge and place them under
   `public/images/content/[slug]/`, following the naming conventions
   in `docs/content-authoring.md`.
8. Fill in the MDX frontmatter, including real `heroImageWidth`/
   `heroImageHeight` matching the actual exported file. Leave
   `status: draft` for now.
9. Run `pnpm content:validate` and fix anything it flags.
10. Open a branch/PR. If your deployment target provides preview
    deployments for branches, use that preview to review the piece as
    it will actually render.
11. When it looks right, set `status: published` and add
    `publishedAt`.
12. Merge to the production branch. The next deploy publishes it.
13. Label the GitHub issue `submission:published`.
14. Delete the raw uploads for that submission from private storage —
    the published, compressed copies under `public/images/content/`
    are now the canonical version.

## What this workflow deliberately does not include

- No in-browser editor or rich-text tool — MDX is written directly.
- No "publish" button — merging into the production branch is the
  publish action.
- No automatic conversion from submission to MDX — a human writes or
  edits the copy every time.
