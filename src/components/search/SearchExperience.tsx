"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { searchIndex } from "@/lib/search/match";
import type { SearchIndex } from "@/lib/search/types";
import { SearchResultCard } from "./SearchResultCard";

function useSearchIndexData() {
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/search/index.json")
      .then((res) => {
        if (!res.ok)
          throw new Error(`Search index request failed: ${res.status}`);
        return res.json();
      })
      .then((data: SearchIndex) => {
        if (!cancelled) setIndex(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { index, loadError };
}

/**
 * Keyed by the current `q` param so a browser back/forward navigation
 * remounts this component with the restored query as its initial state
 * — the React-recommended way to reset state on external change without
 * an effect-driven setState.
 */
function SearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const { index, loadError } = useSearchIndexData();

  const results = useMemo(() => {
    if (!index) return [];
    return searchIndex(index, query);
  }, [index, query]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} role="search" className="flex gap-2">
        <label htmlFor="search-query" className="sr-only">
          Search
        </label>
        <input
          id="search-query"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sermons, relics, rigs, disciples…"
          className="border-bone/20 text-bone placeholder:text-bone/40 focus-visible:outline-blood w-full rounded-md border px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        <button
          type="submit"
          className="border-bone/20 text-bone hover:bg-bone/5 min-h-11 rounded-md border px-5 text-sm font-medium transition-colors"
        >
          Search
        </button>
      </form>

      <div className="mt-10">
        {loadError ? (
          <p className="text-bone/60 text-base">
            Search is temporarily unavailable. Try again shortly.
          </p>
        ) : !index ? (
          <p className="text-bone/60 text-base">Loading search index…</p>
        ) : query.trim() === "" ? (
          <p className="text-bone/60 text-base">Enter a search term above.</p>
        ) : results.length === 0 ? (
          <p className="text-bone/60 text-base">
            No results for &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <ul className="flex flex-col gap-8">
            {results.map((doc) => (
              <SearchResultCard key={doc.url} doc={doc} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function SearchExperience() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  return <SearchForm key={initialQuery} initialQuery={initialQuery} />;
}
