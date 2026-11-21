import type { EditorialItem } from "./loader";
import type { EditorialFrontmatter } from "./schema";

/** Distinct tags across items, sorted alphabetically. Pure — no I/O. */
export function collectTags(items: EditorialItem[]): string[] {
  const tags = new Set<string>();
  for (const item of items) {
    for (const tag of item.frontmatter.tags) tags.add(tag);
  }
  return [...tags].sort();
}

/** Items whose tags include every tag in `selectedTags` (AND filter). */
export function filterByTags(
  items: EditorialItem[],
  selectedTags: string[],
): EditorialItem[] {
  if (selectedTags.length === 0) return items;
  return items.filter((item) =>
    selectedTags.every((tag) => item.frontmatter.tags.includes(tag)),
  );
}

type RelicFrontmatter = Extract<EditorialFrontmatter, { contentType: "relic" }>;
type RelicFacetField = "relicType" | "circuit";

/** Distinct, defined values of a relic facet field, sorted alphabetically. */
export function collectRelicFacetValues(
  items: EditorialItem[],
  field: RelicFacetField,
): string[] {
  const values = new Set<string>();
  for (const item of items) {
    if (item.frontmatter.contentType !== "relic") continue;
    const value = (item.frontmatter as RelicFrontmatter)[field];
    if (value) values.add(value);
  }
  return [...values].sort();
}

/** Items whose relic facet field matches one of `selectedValues` (OR filter). */
export function filterByRelicFacet(
  items: EditorialItem[],
  field: RelicFacetField,
  selectedValues: string[],
): EditorialItem[] {
  if (selectedValues.length === 0) return items;
  return items.filter((item) => {
    if (item.frontmatter.contentType !== "relic") return false;
    const value = (item.frontmatter as RelicFrontmatter)[field];
    return Boolean(value) && selectedValues.includes(value!);
  });
}
