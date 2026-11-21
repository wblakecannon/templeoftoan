# Content Authoring

Editorial content lives in Git as MDX files. There is no CMS and no
in-browser editor — you write a file, validate it, and merge it.

## File locations

```
content/
  editorial/       # sermon, relic, rig, disciple, tech — one file each
  collections/      # curated groupings of editorial items
  templates/        # starting points for new files, copy and rename these
```

Published images live under `public/images/content/[slug]/`, matching
the editorial item's slug. Collection hero images live under
`public/images/content/collections/[collection-slug].jpg`.

`pnpm content:placeholders` generates stand-in hero images (black and
blood red, with the piece title) for any piece or collection whose hero
file does not exist yet. It never overwrites a real image. Replace them
with real photography before publishing.

## Creating a new piece

1. Copy the matching template from `content/templates/` into
   `content/editorial/` (or `content/collections/` for a collection),
   and rename the file to `your-slug.mdx`.
2. Fill in the frontmatter. `slug` must match the filename (minus
   `.mdx`) and use lowercase, hyphen-separated segments.
3. Prepare the hero image: roughly 2,000–3,000px on the long edge,
   sensibly compressed JPEG/WebP/AVIF, saved at
   `public/images/content/your-slug/hero.jpg`.
4. Set `heroImageWidth`/`heroImageHeight` to the image's _actual_ pixel
   dimensions — the validator checks this against the real file.
5. Leave `status: draft` until the piece is ready to publish.
6. Run `pnpm content:validate` and fix anything it flags.
7. When ready, set `status: published` and add `publishedAt` (required
   for published content).

## Frontmatter reference

See `src/lib/content/schema.ts` for the authoritative Zod schema. The
shared fields (title, slug, description, tags, hero image, etc.) apply
to every content type. Each `contentType` adds its own optional fields:

- `sermon`: essays and doctrine. No extra fields.
- `tech`: how-things-work pieces (caps, bias, wiring). No extra fields.
- `relic`: a pedal, amp, guitar, or other object. `manufacturer`, `model`,
  `modelYear`, `relicType` (for example "Pedal"), `circuit`, `keyParts`,
  `streetPrice`, `owner`, `verdict`. `relicType` and `circuit` drive the
  filter pills on `/relics`.
- `rig`: a pedalboard, amp setup, or recording chain. `rigType`, `genre`,
  `signalChain`, `powerSupply`, and `relicSlugs` (relics that appear in it).
- `disciple`: a player or builder profile. `displayName`, `hometown`,
  `occupation`, `instrument`, `relicSlugs`, `website`, `socialLinks`.

`tags` do double duty: they populate the tag filter pills on every
browse page and are one of the fields the static search index matches
against (along with title, description, author, location, and — for
relics: manufacturer, model, and circuit). Use consistent, lowercase,
hyphenated tag values across pieces so filtering and search stay
useful as the archive grows.

## Collections

A collection is a hand-ordered list of editorial slugs under `items`.
Order is explicit and never derived from publish date. Referenced
slugs must exist and must themselves be published.

## MDX components available in body copy

- `<PullQuote>` — large pull quote
- `<EditorialImage src="..." alt="..." width="2400" height="1600" caption="..." />`
  — full-width-of-text-column image with optional caption
- `<FullBleedImage src="..." alt="..." width="2400" height="1600" caption="..." />`
  — image that breaks out to the full viewport width, wider than the
  text column, cropped to a 16:9 ratio regardless of the source
  image's own aspect ratio
- `<ImagePair>` — two side-by-side images. Wrap two `<GalleryImage>`
  children, do not pass image data as props:

  ```mdx
  <ImagePair>
    <GalleryImage
      src="/images/content/my-slug/a.jpg"
      alt="..."
      width="1600"
      height="1067"
      caption="..."
    />
    <GalleryImage
      src="/images/content/my-slug/b.jpg"
      alt="..."
      width="1600"
      height="1067"
      caption="..."
    />
  </ImagePair>
  ```

- `<ImageGallery>` — a grid of images. Same pattern: wrap `<GalleryImage>`
  children, one per photo.
- `<ContributorNote>` — a styled aside for editor's notes or context
  that isn't part of the main narrative

**Important:** always pass component props as plain string literals
(`width="2400"`) — never in `{...}` curly-brace
expressions (`width={2400}`, `images={[{...}]}`). next-mdx-remote's
`blockJS` guard (on by default, and intentionally not disabled here —
this pipeline needs to stay safe for eventual submitted content) strips
_every_ JSX expression container during compilation, not just
array/object literals. A prop written as `width={2400}` silently
disappears — the component receives `undefined`, not `2400` — while
`width="2400"` survives as the string `"2400"`. Every component that
takes a numeric-looking prop (`EditorialImage`,
`FullBleedImage`, `GalleryImage`) accepts and converts a string, so
this is always the correct way to pass them from MDX content.

Only components registered in
`src/components/editorial/mdx-components.tsx` are available — arbitrary
JSX in submitted content is never executed (see
`docs/submission-moderation.md`, once submissions exist).

## Validation

`pnpm content:validate` (also run automatically before `pnpm build` via
the `prebuild` script) checks:

- Frontmatter against the Zod schema
- Duplicate slugs within a content type
- References to collections, relics, and editorial items that don't exist
- Hero images that are missing from disk or whose actual pixel
  dimensions don't match the frontmatter

The build fails loudly on any of the above — nothing is silently
skipped.

## Draft vs. published

Drafts (`status: draft`) are excluded from production builds and from
the sitemap automatically. They show up automatically when running
`pnpm dev` locally, so no extra configuration is needed to preview them
there.

Deployed builds always run with `NODE_ENV=production`, so a preview
deployment (e.g. the `dev` branch) opts in by setting
`SHOW_DRAFT_CONTENT=true` in its build environment. Leave it unset in
production. Drafts are still kept out of the search index regardless, so a previewed draft is browsable and linkable
but will not appear in site search.
