import { Suspense } from "react";
import type { Metadata } from "next";
import { getPublishedEditorial } from "@/lib/content/loader";
import { collectRelicFacetValues, collectTags } from "@/lib/content/facets";
import { RelicFilterableBrowse } from "@/components/editorial/RelicFilterableBrowse";
import { BrowseGrid } from "@/components/editorial/BrowseGrid";

export const metadata: Metadata = {
  title: "Relics | Temple of Toan",
  description:
    "Pedals, amps, and guitars worth worshipping, or at least interrogating.",
  alternates: { canonical: "/relics" },
};

export default function RelicsPage() {
  const items = getPublishedEditorial("relic");
  const availableTags = collectTags(items);
  const availableRelicTypes = collectRelicFacetValues(items, "relicType");
  const availableCircuits = collectRelicFacetValues(items, "circuit");

  return (
    <main
      id="main-content"
      className="mx-auto max-w-5xl flex-1 px-6 py-16 sm:px-10 sm:py-20"
    >
      <h1 className="font-heading text-bone text-3xl tracking-wide sm:text-4xl">
        Relics
      </h1>
      <div className="mt-10">
        <Suspense fallback={<BrowseGrid items={items} />}>
          <RelicFilterableBrowse
            items={items}
            availableTags={availableTags}
            availableRelicTypes={availableRelicTypes}
            availableCircuits={availableCircuits}
            basePath="/relics"
          />
        </Suspense>
      </div>
    </main>
  );
}
