import type { Metadata } from "next";
import {
  contentTypeRoute,
  type EditorialFrontmatter,
} from "@/lib/content/schema";

export function buildEditorialMetadata(
  frontmatter: EditorialFrontmatter,
): Metadata {
  const title = `${frontmatter.seoTitle ?? frontmatter.title} | Temple of Toan`;
  const description = frontmatter.seoDescription ?? frontmatter.description;
  const path = `/${contentTypeRoute(frontmatter.contentType)}/${frontmatter.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "article",
      images: [
        {
          url: frontmatter.heroImage,
          width: frontmatter.heroImageWidth,
          height: frontmatter.heroImageHeight,
          alt: frontmatter.heroImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [frontmatter.heroImage],
    },
  };
}
