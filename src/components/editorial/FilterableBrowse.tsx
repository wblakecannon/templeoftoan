"use client";

import type { EditorialItem } from "@/lib/content/loader";
import { filterByTags } from "@/lib/content/facets";
import { TagFilter, useSelectedTags } from "./TagFilter";
import { BrowseGrid } from "./BrowseGrid";

export function FilterableBrowse({
  items,
  availableTags,
  basePath,
}: {
  items: EditorialItem[];
  availableTags: string[];
  basePath: string;
}) {
  const selectedTags = useSelectedTags();
  const filtered = filterByTags(items, selectedTags);

  return (
    <div>
      <TagFilter availableTags={availableTags} basePath={basePath} />
      <div className="mt-8">
        <BrowseGrid items={filtered} />
      </div>
    </div>
  );
}
