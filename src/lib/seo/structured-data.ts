import {
  contentTypeRoute,
  type EditorialFrontmatter,
} from "@/lib/content/schema";

export function buildArticleSchema(
  frontmatter: EditorialFrontmatter,
  siteUrl: string,
) {
  const url = `${siteUrl}/${contentTypeRoute(frontmatter.contentType)}/${frontmatter.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: frontmatter.title,
    description: frontmatter.description,
    image: `${siteUrl}${frontmatter.heroImage}`,
    author: { "@type": "Person", name: frontmatter.author },
    datePublished: frontmatter.publishedAt,
    dateModified: frontmatter.updatedAt ?? frontmatter.publishedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export interface BreadcrumbSegment {
  name: string;
  path: string;
}

export function buildBreadcrumbSchema(
  segments: BreadcrumbSegment[],
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: segments.map((segment, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: segment.name,
      item: `${siteUrl}${segment.path}`,
    })),
  };
}

export function breadcrumbsForEditorial(
  frontmatter: EditorialFrontmatter,
): BreadcrumbSegment[] {
  const route = contentTypeRoute(frontmatter.contentType);
  const sectionName = route.charAt(0).toUpperCase() + route.slice(1);

  return [
    { name: "Home", path: "/" },
    { name: sectionName, path: `/${route}` },
    { name: frontmatter.title, path: `/${route}/${frontmatter.slug}` },
  ];
}

export function breadcrumbsForCollection(
  title: string,
  slug: string,
): BreadcrumbSegment[] {
  return [
    { name: "Home", path: "/" },
    { name: "Collections", path: "/collections" },
    { name: title, path: `/collections/${slug}` },
  ];
}
