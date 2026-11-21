import Link from "next/link";
import Image from "next/image";
import {
  contentTypeRoute,
  type EditorialFrontmatter,
} from "@/lib/content/schema";

export function SermonPreview({
  frontmatter,
}: {
  frontmatter: EditorialFrontmatter;
}) {
  const href = `/${contentTypeRoute(frontmatter.contentType)}/${frontmatter.slug}`;

  return (
    <Link href={href} className="group block">
      <div className="bg-bone/5 relative aspect-[3/2] overflow-hidden">
        <Image
          src={frontmatter.heroImage}
          alt={frontmatter.heroImageAlt}
          width={frontmatter.heroImageWidth}
          height={frontmatter.heroImageHeight}
          sizes="(min-width: 1024px) 400px, 100vw"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <p className="text-blood mt-3 font-mono text-xs tracking-[0.15em] uppercase">
        {frontmatter.contentType}
      </p>
      <h3 className="font-heading text-bone mt-1 text-lg tracking-wide">
        {frontmatter.title}
      </h3>
      <p className="text-bone/70 mt-1 text-sm leading-relaxed">
        {frontmatter.description}
      </p>
    </Link>
  );
}
