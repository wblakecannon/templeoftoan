import { CaptionedImage, type CaptionedImageProps } from "./CaptionedImage";

export function GalleryImage(props: CaptionedImageProps) {
  return <CaptionedImage sizes="(min-width: 1024px) 250px, 50vw" {...props} />;
}
