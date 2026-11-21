import type { CollectionItem } from "@/lib/content/loader";
import { CollectionPreview } from "@/components/editorial/CollectionPreview";

export function FeaturedCollectionsGrid({
  heading,
  headingId,
  items,
}: {
  heading: string;
  headingId: string;
  items: CollectionItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="mt-16">
      <h2
        id={headingId}
        className="font-heading text-bone text-xl tracking-wide"
      >
        {heading}
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-10 sm:grid-cols-2">
        {items.map((item) => (
          <CollectionPreview
            key={item.frontmatter.slug}
            frontmatter={item.frontmatter}
          />
        ))}
      </div>
    </section>
  );
}
