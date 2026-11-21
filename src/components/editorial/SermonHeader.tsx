import type { EditorialFrontmatter } from "@/lib/content/schema";
import { SITE_URL } from "@/lib/seo/site-url";
import {
  breadcrumbsForEditorial,
  buildArticleSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/structured-data";
import { CaptionedImage } from "./CaptionedImage";
import { StructuredData } from "./StructuredData";

export function SermonHeader({
  frontmatter,
  readingTimeMinutes,
}: {
  frontmatter: EditorialFrontmatter;
  readingTimeMinutes: number;
}) {
  const articleSchema = buildArticleSchema(frontmatter, SITE_URL);
  const breadcrumbSchema = buildBreadcrumbSchema(
    breadcrumbsForEditorial(frontmatter),
    SITE_URL,
  );

  return (
    <header className="mx-auto max-w-3xl px-6 pt-12 text-center sm:px-10">
      <StructuredData schema={articleSchema} />
      <StructuredData schema={breadcrumbSchema} />
      <p className="text-blood font-mono text-xs tracking-[0.15em] uppercase">
        {frontmatter.contentType}
      </p>
      <h1 className="font-heading text-bone mt-3 text-3xl tracking-wide sm:text-4xl">
        {frontmatter.title}
      </h1>
      <p className="text-bone/80 mt-4 text-base leading-relaxed sm:text-lg">
        {frontmatter.description}
      </p>
      <div className="text-bone/60 mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
        <span>{frontmatter.author}</span>
        {frontmatter.location ? (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>{frontmatter.location}</span>
          </>
        ) : null}
        {frontmatter.publishedAt ? (
          <>
            <span aria-hidden="true">&middot;</span>
            <time dateTime={frontmatter.publishedAt}>
              {frontmatter.publishedAt}
            </time>
          </>
        ) : null}
        <span aria-hidden="true">&middot;</span>
        <span>{readingTimeMinutes} min read</span>
      </div>

      <div className="mx-auto mt-8 w-full">
        <CaptionedImage
          src={frontmatter.heroImage}
          alt={frontmatter.heroImageAlt}
          width={frontmatter.heroImageWidth}
          height={frontmatter.heroImageHeight}
          priority
          aspectRatio="4/3"
          sizes="(min-width: 1024px) 768px, 100vw"
        />
      </div>
      {frontmatter.photographer ? (
        <p className="text-bone/50 mt-2 text-xs">
          Photo: {frontmatter.photographer}
        </p>
      ) : null}
    </header>
  );
}
