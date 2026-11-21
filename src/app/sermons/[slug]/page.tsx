import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getAdjacentEditorial,
  getEditorialBySlug,
  getPublishedEditorial,
  getRelatedEditorial,
} from "@/lib/content/loader";
import { SermonHeader } from "@/components/editorial/SermonHeader";
import { TagList } from "@/components/editorial/TagList";
import { RelatedContent } from "@/components/editorial/RelatedContent";
import { ContentPager } from "@/components/editorial/ContentPager";
import { mdxComponents } from "@/components/editorial/mdx-components";
import { ArticleReadTracker } from "@/components/analytics/ArticleReadTracker";
import { buildEditorialMetadata } from "@/lib/seo/editorial-metadata";

export function generateStaticParams() {
  return getPublishedEditorial("sermon").map((item) => ({
    slug: item.frontmatter.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getEditorialBySlug("sermon", slug);
  if (!item) return {};

  return buildEditorialMetadata(item.frontmatter);
}

export default async function SermonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getEditorialBySlug("sermon", slug);
  if (!item) notFound();

  const related = getRelatedEditorial(item);
  const { previous, next } = getAdjacentEditorial(item);

  return (
    <main id="main-content" className="flex-1 pb-20">
      <article>
        <SermonHeader
          frontmatter={item.frontmatter}
          readingTimeMinutes={item.readingTimeMinutes}
        />
        <div className="prose prose-invert mx-auto mt-10 max-w-2xl px-6 sm:px-10">
          <MDXRemote source={item.body} components={mdxComponents} />
          <TagList tags={item.frontmatter.tags} />
          <RelatedContent
            heading="Related"
            items={related.map((r) => r.frontmatter)}
          />
          <ContentPager
            previous={previous?.frontmatter}
            next={next?.frontmatter}
          />
        </div>
        <ArticleReadTracker
          contentType={item.frontmatter.contentType}
          slug={item.frontmatter.slug}
          title={item.frontmatter.title}
        />
      </article>
    </main>
  );
}
