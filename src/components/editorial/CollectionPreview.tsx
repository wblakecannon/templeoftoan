import Link from "next/link";
import Image from "next/image";
import type { CollectionFrontmatter } from "@/lib/content/schema";

export function CollectionPreview({
  frontmatter,
}: {
  frontmatter: CollectionFrontmatter;
}) {
  return (
    <Link href={`/collections/${frontmatter.slug}`} className="group block">
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
      <h3 className="font-heading text-bone mt-3 text-lg tracking-wide">
        {frontmatter.title}
      </h3>
      <p className="text-bone/70 mt-1 text-sm leading-relaxed">
        {frontmatter.description}
      </p>
    </Link>
  );
}
