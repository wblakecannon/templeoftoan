import { CaptionedImage, type CaptionedImageProps } from "./CaptionedImage";

/**
 * Breaks out wider than the text column, but stops well short of true
 * edge-to-edge (100vw with no padding reads as a layout bug, not a
 * deliberate breakout — the caption in particular looks broken flush
 * against the browser edge). `max-w-6xl` + the same `px-6 sm:px-10`
 * gutter every top-level page container uses keeps a visible margin at
 * every viewport width, and constraining the whole <figure> (image +
 * caption) rather than just the image keeps the caption a comfortable
 * reading width instead of stretched full-bleed.
 *
 * Capped to a 16/9 crop so a square or portrait source photo doesn't
 * balloon into an enormous slab of page height. `my-14` (vs. the
 * `my-8` other editorial images use) gives it visibly more breathing
 * room from the surrounding text, since the width jump alone already
 * makes it a bigger visual event than an inline image.
 */
export function FullBleedImage(props: CaptionedImageProps) {
  return (
    <div className="relative left-1/2 my-14 w-screen max-w-none -translate-x-1/2">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <CaptionedImage
          {...props}
          sizes="(min-width: 1152px) 1152px, 100vw"
          aspectRatio="16/9"
        />
      </div>
    </div>
  );
}
