import type { Metadata } from "next";
import { getPublishedCollections } from "@/lib/content/loader";
import { CollectionPreview } from "@/components/editorial/CollectionPreview";

export const metadata: Metadata = {
  title: "Collections | Temple of Toan",
  description: "Curated canons of relics, rigs, and sermons.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  const collections = getPublishedCollections();

  return (
    <main
      id="main-content"
      className="mx-auto max-w-5xl flex-1 px-6 py-16 sm:px-10 sm:py-20"
    >
      <h1 className="font-heading text-bone text-3xl tracking-wide sm:text-4xl">
        Collections
      </h1>
      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionPreview
            key={collection.frontmatter.slug}
            frontmatter={collection.frontmatter}
          />
        ))}
      </div>
    </main>
  );
}
