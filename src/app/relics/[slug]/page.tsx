import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getAdjacentEditorial,
  getEditorialBySlug,
  getPublishedEditorial,
} from "@/lib/content/loader";
import { SermonHeader } from "@/components/editorial/SermonHeader";
import { TagList } from "@/components/editorial/TagList";
import { RelicSpecs } from "@/components/editorial/RelicSpecs";
import { RelatedContent } from "@/components/editorial/RelatedContent";
import { ContentPager } from "@/components/editorial/ContentPager";
import { mdxComponents } from "@/components/editorial/mdx-components";
import { ArticleReadTracker } from "@/components/analytics/ArticleReadTracker";
import { buildEditorialMetadata } from "@/lib/seo/editorial-metadata";

export function generateStaticParams() {
  return getPublishedEditorial("relic").map((item) => ({
    slug: item.frontmatter.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getEditorialBySlug("relic", slug);
  if (!item) return {};

  return buildEditorialMetadata(item.frontmatter);
}

export default async function RelicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getEditorialBySlug("relic", slug);
  if (!item || item.frontmatter.contentType !== "relic") notFound();

  const relatedRigs = getPublishedEditorial("rig")
    .filter(
      (rig) =>
        rig.frontmatter.contentType === "rig" &&
        rig.frontmatter.relicSlugs.includes(slug),
    )
    .map((rig) => rig.frontmatter);

  const worshippedBy = getPublishedEditorial("disciple")
    .filter(
      (disciple) =>
        disciple.frontmatter.contentType === "disciple" &&
        disciple.frontmatter.relicSlugs.includes(slug),
    )
    .map((disciple) => disciple.frontmatter);

  const { previous, next } = getAdjacentEditorial(item);

  return (
    <main id="main-content" className="flex-1 pb-20">
      <article>
        <SermonHeader
          frontmatter={item.frontmatter}
          readingTimeMinutes={item.readingTimeMinutes}
        />
        <div className="prose prose-invert mx-auto mt-10 max-w-2xl px-6 sm:px-10">
          <RelicSpecs relic={item.frontmatter} />
          <MDXRemote source={item.body} components={mdxComponents} />
          <TagList tags={item.frontmatter.tags} />
          <RelatedContent
            heading="Rigs featuring this relic"
            items={relatedRigs}
          />
          <RelatedContent heading="Worshipped by" items={worshippedBy} />
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
