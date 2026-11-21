import type { SearchDocument, SearchIndex } from "./types";

const FIELD_WEIGHTS: { field: keyof SearchDocument; weight: number }[] = [
  { field: "title", weight: 5 },
  { field: "description", weight: 3 },
  { field: "tags", weight: 3 },
  { field: "author", weight: 2 },
  { field: "location", weight: 2 },
  { field: "manufacturer", weight: 2 },
  { field: "model", weight: 2 },
  { field: "circuit", weight: 1 },
  { field: "excerpt", weight: 1 },
];

function fieldText(doc: SearchDocument, field: keyof SearchDocument): string {
  const value = doc[field];
  if (Array.isArray(value)) return value.join(" ");
  return typeof value === "string" ? value : "";
}

function scoreDocument(doc: SearchDocument, terms: string[]): number {
  let score = 0;

  for (const { field, weight } of FIELD_WEIGHTS) {
    const haystack = fieldText(doc, field).toLowerCase();
    for (const term of terms) {
      if (haystack.includes(term)) score += weight;
    }
  }

  return score;
}

/** Splits a query into lowercase, non-empty terms. */
export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);
}

/**
 * Ranks documents by simple weighted substring matching across fields.
 * Pure function so it's usable both on the server (for tests) and in
 * the client search component (over the pre-built static index).
 */
export function searchIndex(
  index: SearchIndex,
  query: string,
): SearchDocument[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  return index
    .map((doc) => ({ doc, score: scoreDocument(doc, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ doc }) => doc);
}
