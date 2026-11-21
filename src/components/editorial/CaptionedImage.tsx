import Image from "next/image";

export interface CaptionedImageProps {
  src: string;
  alt: string;
  // MDX (next-mdx-remote with the default blockJS guard) strips every
  // {...} JSX expression container, not just object/array literals —
  // a bare `width={2448}` compiles away to nothing. So MDX content
  // must pass these as string literals (`width="2448"`); accepting
  // number | string lets normal TSX callers still pass real numbers.
  width: number | string;
  height: number | string;
  caption?: string;
  sizes?: string;
  /**
   * Crops to this ratio (e.g. "3/2") instead of the source image's
   * natural aspect ratio. Used for wide breakouts like FullBleedImage,
   * where an unconstrained ratio can make a square or portrait source
   * photo dominate the page.
   */
  aspectRatio?: string;
  /**
   * Marks this image as an LCP candidate (skips lazy-loading). Every
   * current usage is well below the fold, so this defaults to false —
   * only set it for an image known to render above the fold.
   */
  priority?: boolean;
}

export function CaptionedImage({
  src,
  alt,
  width,
  height,
  caption,
  sizes = "(min-width: 1024px) 700px, 100vw",
  aspectRatio,
  priority = false,
}: CaptionedImageProps) {
  const numericWidth = Number(width);
  const numericHeight = Number(height);

  return (
    <figure>
      <button
        type="button"
        data-lightbox-src={src}
        data-lightbox-width={numericWidth}
        data-lightbox-height={numericHeight}
        data-lightbox-alt={alt}
        data-lightbox-caption={caption}
        className="group relative block w-full cursor-zoom-in"
      >
        {aspectRatio ? (
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover"
            />
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            width={numericWidth}
            height={numericHeight}
            sizes={sizes}
            priority={priority}
            className="h-auto w-full"
          />
        )}
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-8 w-8 text-white drop-shadow"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
        </span>
      </button>
      {caption ? (
        <figcaption className="text-bone/60 mt-2 text-sm">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
