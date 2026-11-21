import { describe, expect, it } from "vitest";
import {
  collectRelicFacetValues,
  collectTags,
  filterByRelicFacet,
  filterByTags,
} from "./facets";
import { makeEditorial } from "./test-fixtures";

describe("collectTags", () => {
  it("returns distinct, sorted tags across items", () => {
    const items = [
      makeEditorial({ slug: "a", tags: ["steel", "hardtail"] }),
      makeEditorial({ slug: "b", tags: ["steel", "surly"] }),
    ];
    expect(collectTags(items)).toEqual(["hardtail", "steel", "surly"]);
  });

  it("returns an empty array when no items have tags", () => {
    expect(collectTags([makeEditorial({ tags: [] })])).toEqual([]);
  });
});

describe("filterByTags", () => {
  it("returns all items when no tags are selected", () => {
    const items = [makeEditorial({ slug: "a" }), makeEditorial({ slug: "b" })];
    expect(filterByTags(items, [])).toEqual(items);
  });

  it("requires every selected tag to be present (AND)", () => {
    const items = [
      makeEditorial({ slug: "a", tags: ["steel", "hardtail"] }),
      makeEditorial({ slug: "b", tags: ["steel"] }),
    ];
    const result = filterByTags(items, ["steel", "hardtail"]);
    expect(result.map((i) => i.frontmatter.slug)).toEqual(["a"]);
  });
});

describe("collectRelicFacetValues", () => {
  it("collects distinct, sorted, defined values for relics only", () => {
    const items = [
      makeEditorial({ slug: "a", contentType: "relic", relicType: "Pedal" }),
      makeEditorial({
        slug: "b",
        contentType: "relic",
        relicType: "Amp",
      }),
      makeEditorial({ slug: "c", contentType: "sermon" }),
    ];
    expect(collectRelicFacetValues(items, "relicType")).toEqual([
      "Amp",
      "Pedal",
    ]);
  });

  it("skips relics with an undefined facet value", () => {
    const items = [makeEditorial({ slug: "a", contentType: "relic" })];
    expect(collectRelicFacetValues(items, "circuit")).toEqual([]);
  });
});

describe("filterByRelicFacet", () => {
  it("returns all items when no values are selected", () => {
    const items = [makeEditorial({ slug: "a", contentType: "relic" })];
    expect(filterByRelicFacet(items, "relicType", [])).toEqual(items);
  });

  it("filters to relics matching one of the selected values (OR)", () => {
    const items = [
      makeEditorial({ slug: "a", contentType: "relic", circuit: "Fuzz" }),
      makeEditorial({ slug: "b", contentType: "relic", circuit: "Delay" }),
      makeEditorial({ slug: "c", contentType: "sermon" }),
    ];
    const result = filterByRelicFacet(items, "circuit", ["Fuzz"]);
    expect(result.map((i) => i.frontmatter.slug)).toEqual(["a"]);
  });
});
