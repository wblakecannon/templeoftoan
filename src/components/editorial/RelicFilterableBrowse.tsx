"use client";

import { useSearchParams } from "next/navigation";
import type { EditorialItem } from "@/lib/content/loader";
import { filterByRelicFacet, filterByTags } from "@/lib/content/facets";
import { parseParamList, PillFilter } from "./PillFilter";
import { useSelectedTags } from "./TagFilter";
import { BrowseGrid } from "./BrowseGrid";

export function RelicFilterableBrowse({
  items,
  availableTags,
  availableRelicTypes,
  availableCircuits,
  basePath,
}: {
  items: EditorialItem[];
  availableTags: string[];
  availableRelicTypes: string[];
  availableCircuits: string[];
  basePath: string;
}) {
  const searchParams = useSearchParams();
  const selectedTags = useSelectedTags();
  const selectedRelicTypes = parseParamList(searchParams, "relicType");
  const selectedCircuits = parseParamList(searchParams, "circuit");

  const filtered = filterByRelicFacet(
    filterByRelicFacet(
      filterByTags(items, selectedTags),
      "relicType",
      selectedRelicTypes,
    ),
    "circuit",
    selectedCircuits,
  );

  return (
    <div>
      <div className="flex flex-col gap-6">
        <PillFilter
          label="Filter by tag"
          param="tags"
          availableValues={availableTags}
          basePath={basePath}
        />
        <PillFilter
          label="Type"
          param="relicType"
          availableValues={availableRelicTypes}
          basePath={basePath}
        />
        <PillFilter
          label="Circuit"
          param="circuit"
          availableValues={availableCircuits}
          basePath={basePath}
        />
      </div>
      <div className="mt-8">
        <BrowseGrid items={filtered} />
      </div>
    </div>
  );
}
