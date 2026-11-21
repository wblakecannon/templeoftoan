import { CaptionedImage, type CaptionedImageProps } from "./CaptionedImage";

export function EditorialImage(props: CaptionedImageProps) {
  return (
    <div className="my-8">
      <CaptionedImage {...props} />
    </div>
  );
}
