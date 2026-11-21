import Link from "next/link";
import type { SearchDocument } from "@/lib/search/types";

export function SearchResultCard({ doc }: { doc: SearchDocument }) {
  return (
    <li>
      <Link href={doc.url} className="group block">
        <p className="text-blood font-mono text-xs tracking-[0.15em] uppercase">
          {doc.contentType}
        </p>
        <h3 className="font-heading text-bone mt-1 text-lg tracking-wide group-hover:underline">
          {doc.title}
        </h3>
        <p className="text-bone/70 mt-1 text-sm leading-relaxed">
          {doc.description}
        </p>
      </Link>
    </li>
  );
}
