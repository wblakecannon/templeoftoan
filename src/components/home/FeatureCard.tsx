import Link from "next/link";
import Image from "next/image";
import {
  contentTypeRoute,
  type EditorialFrontmatter,
} from "@/lib/content/schema";

export function FeatureCard({
  frontmatter,
  eyebrow,
  priority,
}: {
  frontmatter: EditorialFrontmatter;
  eyebrow: string;
  priority?: boolean;
}) {
  const href = `/${contentTypeRoute(frontmatter.contentType)}/${frontmatter.slug}`;

  return (
    <article>
      <Link href={href} className="group block">
        <div className="bg-bone/5 relative aspect-[16/9] overflow-hidden">
          <Image
            src={frontmatter.heroImage}
            alt={frontmatter.heroImageAlt}
            width={frontmatter.heroImageWidth}
            height={frontmatter.heroImageHeight}
            priority={priority}
            sizes="(min-width: 1024px) 900px, 100vw"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </div>
        <p className="text-blood mt-4 font-mono text-xs tracking-[0.15em] uppercase">
          {eyebrow}
        </p>
        <h2 className="font-heading text-bone mt-2 text-2xl tracking-wide sm:text-3xl">
          {frontmatter.title}
        </h2>
        <p className="text-bone/80 mt-3 max-w-2xl text-base leading-relaxed">
          {frontmatter.description}
        </p>
        <p className="text-bone/60 mt-2 text-sm">{frontmatter.author}</p>
      </Link>
    </article>
  );
}
