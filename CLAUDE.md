# CLAUDE.md

Onboarding for anyone (human or AI) picking this repo up cold. Read this
first, then `README.md` and `docs/`.

## What this is

Temple of Toan is a curated, devout, condescending publication about guitar
tone ("toan", the deliberate misspelling): the pedals, amps, rigs, and
players who chase it, and the money spent doing so. Tagline: "Sacrifice
your wallet. Receive toan." Next.js 16 (App Router), TypeScript, Tailwind v4,
MDX via next-mdx-remote, React 19, pnpm. Domain `templeoftoan.com` (Route 53),
hosted on AWS Amplify. This repo was forked from the sibling project
`404gearsnotfound`; the framework is the same, the content model and theme
are not.

## How work happens here (the constraints that bite)

- **The user runs ALL git operations.** Never commit, push, or create
  branches. Make the file changes and stop.
- **Editorial voice:** deadpan cult parody, condescending, affectionate.
  Devotional language (sermons, relics, the faithful, the congregation)
  applied to guitar gear. No em-dashes anywhere. Straight ASCII quotes and
  apostrophes only in content. Never the literal word "placeholder" in
  published body or alt text (the validator rejects it on published items).
- **Facts must be true.** The jokes are in the voice, not the claims.
  History, dates, and attributions get hedged or flagged for verification
  in a `<ContributorNote>`. Invented people or rigs must be labeled as
  composites or concepts.
- **Architecture is deliberately minimal.** No CMS, database, admin
  dashboard, or runtime content API. Git plus MDX is the publishing system.
  Do not add large dependencies or client components that are not needed.
- **Commit messages** (only when asked to draft one): lowercase plain prose,
  no conventional-commits prefixes, `<thing> init` for new pieces.

## Content model

Editorial MDX lives in `content/editorial/`. Types (route in parens):
`sermon` (/sermons), `relic` (/relics, gear), `rig` (/rigs, boards and
signal chains), `disciple` (/disciples, people), `tech` (/tech).
Collections in `content/collections/`. Copy a starting point from
`content/templates/`. Schema: `src/lib/content/schema.ts` (Zod).

- `relic` has `relicType` and `circuit` facets. `rig` and `disciple` link to
  relics via `relicSlugs`, validated in `src/lib/content/loader.ts`.
- Images: `public/images/content/<slug>/hero.jpg`. `heroImageWidth` and
  `heroImageHeight` must equal the real file or `pnpm content:validate`
  fails. `pnpm content:placeholders` makes stand-in heroes for any that
  are missing; never overwrites real files.
- MDX component props must be plain string literals (`width="2400"`).
- Drafts show under `pnpm dev` and when `SHOW_DRAFT_CONTENT=true`, and are
  hidden in production. Content is published from `main` (no separate dev branch yet).
- Theme tokens: `abyss` (background), `bone` (text), `blood` (accent),
  `gold`. Heading font is Pirata One.

## Commands

```bash
pnpm dev                 # http://localhost:3000
pnpm content:validate    # frontmatter, references, hero dimensions
pnpm content:placeholders # stand-in hero images
pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e
pnpm build               # runs content:validate + content:index first
```

## Known leftovers from the fork

- `src/lib/submissions/` still contains optional GPX upload handling that
  the public form no longer exposes. Safe to remove.
- Social links (`src/lib/social/links.ts`) only list email. Add real
  Instagram and other handles when they exist.
- Analytics is off until `NEXT_PUBLIC_ENABLE_ANALYTICS` and a new
  `NEXT_PUBLIC_GA_MEASUREMENT_ID` are set. The 404 site's GA ID was removed.
- E2E coverage for content pages was removed with the old content. Add new
  specs once there is published content.
