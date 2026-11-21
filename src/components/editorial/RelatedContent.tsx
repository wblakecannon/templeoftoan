import Link from "next/link";
import {
  contentTypeRoute,
  type EditorialFrontmatter,
} from "@/lib/content/schema";

export function RelatedContent({
  heading,
  items,
}: {
  heading: string;
  items: EditorialFrontmatter[];
}) {
  if (items.length === 0) return null;

  return (
    <nav aria-label={heading} className="border-bone/10 mt-10 border-t pt-6">
      <p className="text-bone/60 font-mono text-xs tracking-[0.15em] uppercase">
        {heading}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/${contentTypeRoute(item.contentType)}/${item.slug}`}
              className="text-bone decoration-bone/30 hover:decoration-bone font-medium underline underline-offset-2"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
