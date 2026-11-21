"use client";

import { useSearchParams } from "next/navigation";
import { parseParamList, PillFilter } from "./PillFilter";

export function useSelectedTags(): string[] {
  const searchParams = useSearchParams();
  return parseParamList(searchParams, "tags");
}

export function TagFilter({
  availableTags,
  basePath,
}: {
  availableTags: string[];
  basePath: string;
}) {
  return (
    <PillFilter
      label="Filter by tag"
      param="tags"
      availableValues={availableTags}
      basePath={basePath}
    />
  );
}
