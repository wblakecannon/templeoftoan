import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchExperience } from "@/components/search/SearchExperience";

export const metadata: Metadata = {
  title: "Search | Temple of Toan",
  description: "Search sermons, relics, rigs, and disciples.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return (
    <main
      id="main-content"
      className="mx-auto max-w-2xl flex-1 px-6 py-16 sm:px-10 sm:py-20"
    >
      <h1 className="font-heading text-bone text-3xl tracking-wide sm:text-4xl">
        Search
      </h1>
      <div className="mt-8">
        <Suspense fallback={<p className="text-bone/60 text-base">Loading…</p>}>
          <SearchExperience />
        </Suspense>
      </div>
    </main>
  );
}
