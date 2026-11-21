import { Suspense } from "react";
import type { Metadata } from "next";
import { getPublishedEditorial } from "@/lib/content/loader";
import { collectTags } from "@/lib/content/facets";
import { FilterableBrowse } from "@/components/editorial/FilterableBrowse";
import { BrowseGrid } from "@/components/editorial/BrowseGrid";

export const metadata: Metadata = {
  title: "Tech | Temple of Toan",
  description:
    "Capacitors, bias, and other technical rites, with the mojo removed.",
  alternates: { canonical: "/tech" },
};

export default function TechPage() {
  const items = getPublishedEditorial("tech");
  const availableTags = collectTags(items);

  return (
    <main
      id="main-content"
      className="mx-auto max-w-5xl flex-1 px-6 py-16 sm:px-10 sm:py-20"
    >
      <h1 className="font-heading text-bone text-3xl tracking-wide sm:text-4xl">
        Tech
      </h1>
      <div className="mt-10">
        <Suspense fallback={<BrowseGrid items={items} />}>
          <FilterableBrowse
            items={items}
            availableTags={availableTags}
            basePath="/tech"
          />
        </Suspense>
      </div>
    </main>
  );
}
