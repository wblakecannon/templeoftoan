/**
 * Takes <GalleryImage> children rather than an array prop — MDX's JSX
 * runtime doesn't reliably serialize array/object literal prop
 * expressions through next-mdx-remote's compile-and-eval pipeline, but
 * children (nested elements) work fine.
 */
export function ImageGallery({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-lightbox-gallery
      className="my-8 grid grid-cols-2 gap-4 sm:grid-cols-3"
    >
      {children}
    </div>
  );
}
