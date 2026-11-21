import Link from "next/link";
import {
  contentTypeRoute,
  type EditorialFrontmatter,
} from "@/lib/content/schema";

function PagerLink({
  direction,
  frontmatter,
}: {
  direction: "previous" | "next";
  frontmatter: EditorialFrontmatter;
}) {
  const href = `/${contentTypeRoute(frontmatter.contentType)}/${frontmatter.slug}`;

  return (
    <Link
      href={href}
      className={`flex flex-col gap-1 ${direction === "next" ? "text-right" : ""}`}
    >
      <span className="text-bone/60 font-mono text-xs tracking-[0.15em] uppercase">
        {direction === "previous" ? "Previous" : "Next"}
      </span>
      <span className="text-bone decoration-bone/30 hover:decoration-bone font-medium underline underline-offset-2">
        {frontmatter.title}
      </span>
    </Link>
  );
}

export function ContentPager({
  previous,
  next,
}: {
  previous?: EditorialFrontmatter;
  next?: EditorialFrontmatter;
}) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="More in this section"
      className="border-bone/10 mt-10 flex justify-between border-t pt-6"
    >
      <div>
        {previous ? (
          <PagerLink direction="previous" frontmatter={previous} />
        ) : null}
      </div>
      <div>
        {next ? <PagerLink direction="next" frontmatter={next} /> : null}
      </div>
    </nav>
  );
}
