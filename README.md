# Temple of Toan

Sacrifice your wallet. Receive toan.

A curated publication about guitar tone, gear obsession, and the people who
will spend anything chasing it. Built on the same minimal Git-plus-MDX
framework as 404 Gears Not Found.

- Stack: Next.js 16, TypeScript, Tailwind v4, MDX, pnpm
- Content: `content/editorial/*.mdx` (sermon, relic, rig, disciple, tech)
- Docs: `CLAUDE.md`, `docs/content-authoring.md`, `docs/editorial-workflow.md`,
  `docs/submission-moderation.md`

## Develop

```bash
pnpm install
pnpm dev
```

Drafts are visible in dev. Run `pnpm content:placeholders` if a new piece
has no hero image yet.

## Deploy (AWS Amplify)

Domain: `templeoftoan.com` (Route 53). Connect the repo to Amplify, use the
default Next.js build (`pnpm build`, which runs content validation first).

- Production branch (`main`): set `NEXT_PUBLIC_SITE_URL=https://www.templeoftoan.com`
  and `NEXT_PUBLIC_ENABLE_INDEXING=true` only when ready to be indexed.
- Preview branch (`development`): set `NEXT_PUBLIC_SITE_URL=https://dev.templeoftoan.com`
  and `SHOW_DRAFT_CONTENT=true`. Leave indexing off.
- See `.env.example` for analytics and submission (GitHub, S3) settings.
