import Link from "next/link";
import {
  getPublishedCollections,
  getPublishedEditorial,
} from "@/lib/content/loader";
import { FeatureCard } from "@/components/home/FeatureCard";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { FeaturedCollectionsGrid } from "@/components/home/FeaturedCollectionsGrid";
import { SermonPreview } from "@/components/editorial/SermonPreview";

export default function Home() {
  const allPublished = getPublishedEditorial();
  const sermons = getPublishedEditorial("sermon");
  const hero =
    sermons.find((item) => item.frontmatter.featured) ?? allPublished[0];
  const featuredRelic = getPublishedEditorial("relic").find(
    (item) => item.frontmatter.featured,
  );
  const featuredCollections = getPublishedCollections().slice(0, 4);
  const featuredDisciples = getPublishedEditorial("disciple").slice(0, 4);
  const featuredRigs = getPublishedEditorial("rig").slice(0, 4);

  const excludedSlugs = new Set(
    [hero, featuredRelic, ...featuredDisciples, ...featuredRigs]
      .filter((item) => Boolean(item))
      .map((item) => item!.frontmatter.slug),
  );
  const currentSelection = allPublished
    .filter((item) => !excludedSlugs.has(item.frontmatter.slug))
    .slice(0, 4);

  return (
    <main
      id="main-content"
      className="mx-auto max-w-5xl flex-1 px-6 py-16 sm:px-10 sm:py-20"
    >
      {hero ? (
        <section aria-labelledby="hero-heading">
          <h1 id="hero-heading" className="sr-only">
            Featured sermon
          </h1>
          <FeatureCard
            frontmatter={hero.frontmatter}
            eyebrow="Featured"
            priority
          />
        </section>
      ) : null}

      {currentSelection.length > 0 ? (
        <section aria-labelledby="selection-heading" className="mt-16">
          <h2
            id="selection-heading"
            className="font-heading text-bone text-3xl tracking-wide"
          >
            Recent Offerings
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-10 sm:grid-cols-2">
            {currentSelection.map((item) => (
              <SermonPreview
                key={item.frontmatter.slug}
                frontmatter={item.frontmatter}
              />
            ))}
          </div>
        </section>
      ) : null}

      <FeaturedGrid
        heading="Featured Rigs"
        headingId="rig-heading"
        items={featuredRigs}
      />

      <FeaturedGrid
        heading="Featured Disciples"
        headingId="disciple-heading"
        items={featuredDisciples}
      />

      {featuredRelic ? (
        <section aria-labelledby="relic-heading" className="mt-16">
          <h2
            id="relic-heading"
            className="font-heading text-bone text-3xl tracking-wide"
          >
            Featured Relic
          </h2>
          <div className="mt-6">
            <FeatureCard
              frontmatter={featuredRelic.frontmatter}
              eyebrow="Relic"
            />
          </div>
        </section>
      ) : null}

      <FeaturedCollectionsGrid
        heading="Featured Collections"
        headingId="collection-heading"
        items={featuredCollections}
      />

      <section
        aria-labelledby="manifesto-heading"
        className="mt-20 text-center"
      >
        <h2 id="manifesto-heading" className="sr-only">
          Manifesto
        </h2>
        <p className="font-heading text-bone mx-auto max-w-2xl text-3xl tracking-wide sm:text-4xl">
          You do not need another pedal. You will buy it anyway. We are here to
          make that feel like theology.
        </p>
      </section>

      <section
        aria-labelledby="submit-heading"
        className="border-bone/10 mt-20 border-t pt-12 text-center"
      >
        <h2
          id="submit-heading"
          className="font-heading text-bone text-3xl tracking-wide"
        >
          Have Something to Confess?
        </h2>
        <p className="text-bone/80 mx-auto mt-4 max-w-xl text-base leading-relaxed">
          Polished writing isn&rsquo;t required. Good photos and an honest
          account of what you spent matter more. Submitting doesn&rsquo;t
          guarantee publication, and accepted work may be edited for clarity and
          presentation before it goes live.
        </p>
        <Link
          href="/submit"
          className="border-bone/20 text-bone hover:bg-bone/5 mt-6 inline-flex min-h-11 items-center justify-center rounded-md border px-6 py-3 text-sm font-medium transition-colors"
        >
          Confess a relic, rig, or sermon
        </Link>
      </section>
    </main>
  );
}
