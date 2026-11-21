const MAGIC_BYTES: { mime: string; check: (bytes: Uint8Array) => boolean }[] = [
  {
    mime: "image/jpeg",
    check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: "image/png",
    check: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    mime: "image/webp",
    check: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

/**
 * Sniffs the real image format from magic bytes rather than trusting the
 * browser-supplied MIME type or file extension, which can both be
 * spoofed by a file that only pretends to be an image. Returns null for
 * anything that doesn't match a known image signature.
 */
export function sniffImageMimeType(bytes: Uint8Array): string | null {
  for (const { mime, check } of MAGIC_BYTES) {
    if (check(bytes)) return mime;
  }
  return null;
}

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/gpx+xml": "gpx",
};

export function extensionForMimeType(mime: string): string | undefined {
  return EXTENSION_BY_MIME[mime];
}

const GPX_ROOT_TAG_PATTERN = /<gpx[\s>]/i;

/**
 * GPX has no magic-byte signature (it's plain-text XML), so this looks
 * for the <gpx> root element instead — same spirit as sniffImageMimeType:
 * never trust the browser-supplied MIME type or a .gpx extension alone.
 */
export function isLikelyGpx(bytes: Uint8Array): boolean {
  return GPX_ROOT_TAG_PATTERN.test(
    new TextDecoder("utf-8", { fatal: false }).decode(bytes),
  );
}
