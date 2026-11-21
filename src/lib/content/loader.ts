import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import {
  collectionFrontmatterSchema,
  editorialFrontmatterSchema,
  type CollectionFrontmatter,
  type ContentType,
  type EditorialFrontmatter,
} from "./schema";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const EDITORIAL_DIR = path.join(CONTENT_ROOT, "editorial");
const COLLECTIONS_DIR = path.join(CONTENT_ROOT, "collections");

export interface ContentValidationError {
  file: string;
  messages: string[];
}

export interface EditorialItem {
  frontmatter: EditorialFrontmatter;
  body: string;
  file: string;
  readingTimeMinutes: number;
}

export interface CollectionItem {
  frontmatter: CollectionFrontmatter;
  body: string;
  file: string;
}

function showDrafts(): boolean {
  // Local `pnpm dev` shows drafts automatically. Deployed builds always run
  // with NODE_ENV=production, so a preview environment (e.g. the dev branch)
  // opts in explicitly with SHOW_DRAFT_CONTENT=true. Production leaves it unset.
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.SHOW_DRAFT_CONTENT === "true"
  );
}

function listMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => path.join(dir, file));
}

interface RawLoadResult<T> {
  items: T[];
  errors: ContentValidationError[];
}

function loadEditorialRaw(): RawLoadResult<EditorialItem> {
  const items: EditorialItem[] = [];
  const errors: ContentValidationError[] = [];

  for (const filePath of listMdxFiles(EDITORIAL_DIR)) {
    const relativeFile = path.relative(CONTENT_ROOT, filePath);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);

    const result = editorialFrontmatterSchema.safeParse(data);
    if (!result.success) {
      errors.push({
        file: relativeFile,
        messages: result.error.issues.map(
          (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
        ),
      });
      continue;
    }

    items.push({
      frontmatter: result.data,
      body: content,
      file: relativeFile,
      readingTimeMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
    });
  }

  return { items, errors };
}

function loadCollectionsRaw(): RawLoadResult<CollectionItem> {
  const items: CollectionItem[] = [];
  const errors: ContentValidationError[] = [];

  for (const filePath of listMdxFiles(COLLECTIONS_DIR)) {
    const relativeFile = path.relative(CONTENT_ROOT, filePath);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);

    const result = collectionFrontmatterSchema.safeParse(data);
    if (!result.success) {
      errors.push({
        file: relativeFile,
        messages: result.error.issues.map(
          (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
        ),
      });
      continue;
    }

    items.push({ frontmatter: result.data, body: content, file: relativeFile });
  }

  return { items, errors };
}

export function validateContentReferences(
  editorial: EditorialItem[],
  collections: CollectionItem[],
): ContentValidationError[] {
  const errors: ContentValidationError[] = [];
  const editorialSlugs = new Set(
    editorial.map((item) => item.frontmatter.slug),
  );
  const collectionSlugs = new Set(
    collections.map((item) => item.frontmatter.slug),
  );

  const relicSlugs = new Set(
    editorial
      .filter((item) => item.frontmatter.contentType === "relic")
      .map((item) => item.frontmatter.slug),
  );

  const seenEditorialSlugs = new Map<string, string[]>();
  for (const item of editorial) {
    const key = `${item.frontmatter.contentType}:${item.frontmatter.slug}`;
    seenEditorialSlugs.set(key, [
      ...(seenEditorialSlugs.get(key) ?? []),
      item.file,
    ]);
  }
  for (const [key, files] of seenEditorialSlugs) {
    if (files.length > 1) {
      const [contentType, slug] = key.split(":");
      for (const file of files) {
        errors.push({
          file,
          messages: [
            `Duplicate slug "${slug}" for contentType "${contentType}"`,
          ],
        });
      }
    }
  }

  const seenCollectionSlugs = new Map<string, string[]>();
  for (const item of collections) {
    seenCollectionSlugs.set(item.frontmatter.slug, [
      ...(seenCollectionSlugs.get(item.frontmatter.slug) ?? []),
      item.file,
    ]);
  }
  for (const [slug, files] of seenCollectionSlugs) {
    if (files.length > 1) {
      for (const file of files) {
        errors.push({
          file,
          messages: [`Duplicate collection slug "${slug}"`],
        });
      }
    }
  }

  for (const item of editorial) {
    const fileErrors: string[] = [];

    for (const collectionSlug of item.frontmatter.collectionSlugs) {
      if (!collectionSlugs.has(collectionSlug)) {
        fileErrors.push(`Unknown collection: ${collectionSlug}`);
      }
    }

    if (
      item.frontmatter.contentType === "rig" ||
      item.frontmatter.contentType === "disciple"
    ) {
      for (const relicSlug of item.frontmatter.relicSlugs) {
        if (!relicSlugs.has(relicSlug)) {
          fileErrors.push(`Referenced relic slug does not exist: ${relicSlug}`);
        }
      }
    }

    if (fileErrors.length > 0) {
      errors.push({ file: item.file, messages: fileErrors });
    }
  }

  for (const collection of collections) {
    const fileErrors: string[] = [];
    for (const itemSlug of collection.frontmatter.items) {
      if (!editorialSlugs.has(itemSlug)) {
        fileErrors.push(
          `Referenced editorial slug does not exist: ${itemSlug}`,
        );
      }
    }
    if (fileErrors.length > 0) {
      errors.push({ file: collection.file, messages: fileErrors });
    }
  }

  return errors;
}

export interface LoadedContent {
  editorial: EditorialItem[];
  collections: CollectionItem[];
  errors: ContentValidationError[];
}

let cache: LoadedContent | null = null;

export function loadAllContent(): LoadedContent {
  if (cache) return cache;

  const editorialRaw = loadEditorialRaw();
  const collectionsRaw = loadCollectionsRaw();
  const referenceErrors = validateContentReferences(
    editorialRaw.items,
    collectionsRaw.items,
  );

  cache = {
    editorial: editorialRaw.items,
    collections: collectionsRaw.items,
    errors: [
      ...editorialRaw.errors,
      ...collectionsRaw.errors,
      ...referenceErrors,
    ],
  };

  return cache;
}

function isVisible(item: EditorialItem): boolean {
  return item.frontmatter.status === "published" || showDrafts();
}

export function getPublishedEditorial(
  contentType?: ContentType,
  options: { includeDrafts?: boolean } = {},
): EditorialItem[] {
  // Build-time scripts that emit shipped artifacts (search index, route
  // data) run as plain tsx processes without NODE_ENV=production, so they
  // pass includeDrafts:false to keep drafts out of production output
  // regardless of the ambient environment. The running app omits the
  // option and gets the env-based dev-preview behavior via isVisible().
  const includeDrafts = options.includeDrafts ?? true;
  const { editorial } = loadAllContent();
  return editorial
    .filter((item) => includeDrafts || item.frontmatter.status === "published")
    .filter(isVisible)
    .filter(
      (item) => !contentType || item.frontmatter.contentType === contentType,
    )
    .sort((a, b) =>
      (b.frontmatter.publishedAt ?? "").localeCompare(
        a.frontmatter.publishedAt ?? "",
      ),
    );
}

export function getEditorialBySlug(
  contentType: ContentType,
  slug: string,
): EditorialItem | undefined {
  const { editorial } = loadAllContent();
  return editorial.find(
    (item) =>
      item.frontmatter.contentType === contentType &&
      item.frontmatter.slug === slug &&
      isVisible(item),
  );
}

export function getPublishedCollections(): CollectionItem[] {
  const { collections } = loadAllContent();
  return collections.filter(
    (item) => item.frontmatter.status === "published" || showDrafts(),
  );
}

export function getCollectionBySlug(slug: string): CollectionItem | undefined {
  return getPublishedCollections().find(
    (item) => item.frontmatter.slug === slug,
  );
}

export function getEditorialForCollection(
  collection: CollectionItem,
): EditorialItem[] {
  const bySlug = new Map(
    getPublishedEditorial().map((item) => [item.frontmatter.slug, item]),
  );
  return collection.frontmatter.items
    .map((slug) => bySlug.get(slug))
    .filter((item): item is EditorialItem => Boolean(item));
}

/**
 * Ranks candidates by shared-tag count with `item`, breaking ties by
 * publish recency. Pure function of its inputs so the ranking logic can
 * be unit tested without touching disk.
 */
export function pickRelatedEditorial(
  item: EditorialItem,
  candidates: EditorialItem[],
  limit = 3,
): EditorialItem[] {
  const tags = new Set(item.frontmatter.tags);
  if (tags.size === 0) return [];

  return candidates
    .filter((candidate) => candidate.frontmatter.slug !== item.frontmatter.slug)
    .map((candidate) => ({
      candidate,
      sharedTags: candidate.frontmatter.tags.filter((tag) => tags.has(tag))
        .length,
    }))
    .filter(({ sharedTags }) => sharedTags > 0)
    .sort((a, b) => {
      if (b.sharedTags !== a.sharedTags) return b.sharedTags - a.sharedTags;
      return (b.candidate.frontmatter.publishedAt ?? "").localeCompare(
        a.candidate.frontmatter.publishedAt ?? "",
      );
    })
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

/**
 * Suggests related editorial items by shared tag count, breaking ties by
 * publish recency. Returns [] when the item has no tags to compare on.
 */
export function getRelatedEditorial(
  item: EditorialItem,
  limit = 3,
): EditorialItem[] {
  return pickRelatedEditorial(item, getPublishedEditorial(), limit);
}

export interface AdjacentEditorial {
  previous?: EditorialItem;
  next?: EditorialItem;
}

/**
 * Chronological neighbors of `item` within its own content type.
 * getPublishedEditorial() sorts newest-first, so "previous" (published
 * earlier) sits at the following index and "next" (published later) at
 * the preceding index.
 */
export function getAdjacentEditorial(item: EditorialItem): AdjacentEditorial {
  const siblings = getPublishedEditorial(item.frontmatter.contentType);
  const index = siblings.findIndex(
    (sibling) => sibling.frontmatter.slug === item.frontmatter.slug,
  );
  if (index === -1) return {};

  return {
    previous: siblings[index + 1],
    next: siblings[index - 1],
  };
}
