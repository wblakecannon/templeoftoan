import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getCollectionBySlug,
  getEditorialForCollection,
  getPublishedCollections,
} from "@/lib/content/loader";
import { BrowseGrid } from "@/components/editorial/BrowseGrid";
import { CaptionedImage } from "@/components/editorial/CaptionedImage";
import { StructuredData } from "@/components/editorial/StructuredData";
import { mdxComponents } from "@/components/editorial/mdx-components";
import { SITE_URL } from "@/lib/seo/site-url";
import {
  breadcrumbsForCollection,
  buildBreadcrumbSchema,
} from "@/lib/seo/structured-data";

export function generateStaticParams() {
  return getPublishedCollections().map((item) => ({
    slug: item.frontmatter.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) return {};

  const title = `${collection.frontmatter.title} | Temple of Toan`;
  const {
    description,
    heroImage,
    heroImageWidth,
    heroImageHeight,
    heroImageAlt,
  } = collection.frontmatter;

  return {
    title,
    description,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: {
      title,
      description,
      url: `/collections/${slug}`,
      type: "website",
      images: [
        {
          url: heroImage,
          width: heroImageWidth,
          height: heroImageHeight,
          alt: heroImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [heroImage],
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();

  const items = getEditorialForCollection(collection);
  const breadcrumbSchema = buildBreadcrumbSchema(
    breadcrumbsForCollection(
      collection.frontmatter.title,
      collection.frontmatter.slug,
    ),
    SITE_URL,
  );

  return (
    <main
      id="main-content"
      className="mx-auto max-w-5xl flex-1 px-6 py-16 sm:px-10 sm:py-20"
    >
      <StructuredData schema={breadcrumbSchema} />
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-blood font-mono text-xs tracking-[0.15em] uppercase">
          Collection
        </p>
        <h1 className="font-heading text-bone mt-3 text-3xl tracking-wide sm:text-4xl">
          {collection.frontmatter.title}
        </h1>
        <p className="text-bone/80 mt-4 text-base leading-relaxed sm:text-lg">
          {collection.frontmatter.description}
        </p>
        <p className="text-bone/60 mt-2 text-sm">
          Curated by {collection.frontmatter.curator}
        </p>
      </header>

      <div className="mx-auto mt-10 w-full max-w-3xl">
        <CaptionedImage
          src={collection.frontmatter.heroImage}
          alt={collection.frontmatter.heroImageAlt}
          width={collection.frontmatter.heroImageWidth}
          height={collection.frontmatter.heroImageHeight}
          priority
          aspectRatio="4/3"
          sizes="(min-width: 1024px) 768px, 100vw"
        />
      </div>

      <div className="prose prose-invert mx-auto mt-8 max-w-2xl">
        <MDXRemote source={collection.body} components={mdxComponents} />
      </div>

      <div className="mt-12">
        <BrowseGrid items={items} />
      </div>
    </main>
  );
}
