import type { EditorialItem } from "@/lib/content/loader";
import { SermonPreview } from "./SermonPreview";

export function BrowseGrid({ items }: { items: EditorialItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-bone/60 text-base">Nothing published here yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <SermonPreview
          key={item.frontmatter.slug}
          frontmatter={item.frontmatter}
        />
      ))}
    </div>
  );
}
