import { z } from "zod";

const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Slug must be lowercase alphanumeric segments separated by single hyphens",
  );

export type ContentType = "sermon" | "relic" | "rig" | "disciple" | "tech";

const STATUSES = ["draft", "published"] as const;
export type ContentStatus = (typeof STATUSES)[number];

const baseFields = {
  title: z.string().min(1),
  slug: slugSchema,
  description: z.string().min(1),
  status: z.enum(STATUSES),
  publishedAt: z.iso.date().optional(),
  updatedAt: z.iso.date().optional(),
  featured: z.boolean(),
  author: z.string().min(1),
  authorUrl: z.url().optional(),
  tags: z.array(z.string().min(1)).default([]),
  collectionSlugs: z.array(slugSchema).default([]),
  heroImage: z.string().min(1),
  heroImageAlt: z.string().min(1),
  heroImageWidth: z.number().int().positive(),
  heroImageHeight: z.number().int().positive(),
  photographer: z.string().optional(),
  photographerUrl: z.url().optional(),
  location: z.string().optional(),
  canonicalUrl: z.url().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
};

const sermonSchema = z.object({
  ...baseFields,
  contentType: z.literal("sermon"),
});

const techSchema = z.object({
  ...baseFields,
  contentType: z.literal("tech"),
});

// A relic is a piece of gear: a pedal, amp, guitar, or other object of
// devotion.
const relicSchema = z.object({
  ...baseFields,
  contentType: z.literal("relic"),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  modelYear: z.number().int().optional(),
  relicType: z.string().optional(),
  circuit: z.string().optional(),
  keyParts: z.string().optional(),
  streetPrice: z.string().optional(),
  owner: z.string().optional(),
  verdict: z.string().optional(),
});

// A rig is a pedalboard, amp setup, or recording chain, plus the rituals
// around it.
const rigSchema = z.object({
  ...baseFields,
  contentType: z.literal("rig"),
  rigType: z.string().optional(),
  genre: z.string().optional(),
  signalChain: z.string().optional(),
  powerSupply: z.string().optional(),
  relicSlugs: z.array(slugSchema).default([]),
});

const discipleSchema = z.object({
  ...baseFields,
  contentType: z.literal("disciple"),
  displayName: z.string().optional(),
  hometown: z.string().optional(),
  occupation: z.string().optional(),
  instrument: z.string().optional(),
  relicSlugs: z.array(slugSchema).default([]),
  website: z.url().optional(),
  socialLinks: z.array(z.url()).default([]),
});

export const editorialFrontmatterSchema = z
  .discriminatedUnion("contentType", [
    sermonSchema,
    relicSchema,
    rigSchema,
    discipleSchema,
    techSchema,
  ])
  .refine((data) => data.status !== "published" || Boolean(data.publishedAt), {
    error: "Published content must include publishedAt",
    path: ["publishedAt"],
  });

export type EditorialFrontmatter = z.infer<typeof editorialFrontmatterSchema>;

export const collectionFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  description: z.string().min(1),
  status: z.enum(STATUSES),
  heroImage: z.string().min(1),
  heroImageAlt: z.string().min(1),
  heroImageWidth: z.number().int().positive(),
  heroImageHeight: z.number().int().positive(),
  curator: z.string().min(1),
  items: z.array(slugSchema).min(1),
});

export type CollectionFrontmatter = z.infer<typeof collectionFrontmatterSchema>;

export function contentTypeRoute(contentType: ContentType): string {
  switch (contentType) {
    case "sermon":
      return "sermons";
    case "relic":
      return "relics";
    case "rig":
      return "rigs";
    case "disciple":
      return "disciples";
    case "tech":
      return "tech";
  }
}
