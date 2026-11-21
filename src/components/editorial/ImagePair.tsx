/**
 * Takes two <EditorialImage>-style children rather than left/right object
 * props — see ImageGallery.tsx for why object literal props don't survive
 * next-mdx-remote's compile pipeline.
 */
export function ImagePair({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-lightbox-gallery
      className="my-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {children}
    </div>
  );
}
