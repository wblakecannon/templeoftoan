import { describe, expect, it } from "vitest";
import {
  extensionForMimeType,
  isLikelyGpx,
  sniffImageMimeType,
} from "./file-validation";

describe("sniffImageMimeType", () => {
  it("identifies a JPEG from its magic bytes", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
    expect(sniffImageMimeType(bytes)).toBe("image/jpeg");
  });

  it("identifies a PNG from its magic bytes", () => {
    const bytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    expect(sniffImageMimeType(bytes)).toBe("image/png");
  });

  it("identifies a WebP from its RIFF/WEBP magic bytes", () => {
    const bytes = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
    ]);
    expect(sniffImageMimeType(bytes)).toBe("image/webp");
  });

  it("returns null for a plain text file renamed to look like an image", () => {
    const bytes = new TextEncoder().encode(
      "<html><body>not an image</body></html>",
    );
    expect(sniffImageMimeType(bytes)).toBeNull();
  });

  it("returns null for an SVG (deliberately not an accepted format)", () => {
    const bytes = new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
    );
    expect(sniffImageMimeType(bytes)).toBeNull();
  });

  it("returns null for an empty buffer", () => {
    expect(sniffImageMimeType(new Uint8Array())).toBeNull();
  });
});

describe("extensionForMimeType", () => {
  it("maps known image MIME types to their extension", () => {
    expect(extensionForMimeType("image/jpeg")).toBe("jpg");
    expect(extensionForMimeType("image/png")).toBe("png");
    expect(extensionForMimeType("image/webp")).toBe("webp");
  });

  it("returns undefined for an unknown MIME type", () => {
    expect(extensionForMimeType("application/octet-stream")).toBeUndefined();
  });

  it("maps application/gpx+xml to gpx", () => {
    expect(extensionForMimeType("application/gpx+xml")).toBe("gpx");
  });
});

describe("isLikelyGpx", () => {
  it("identifies a GPX file with an XML declaration", () => {
    const bytes = new TextEncoder().encode(
      '<?xml version="1.0"?>\n<gpx version="1.1"><trk></trk></gpx>',
    );
    expect(isLikelyGpx(bytes)).toBe(true);
  });

  it("identifies a GPX file without an XML declaration", () => {
    const bytes = new TextEncoder().encode("<gpx><trk></trk></gpx>");
    expect(isLikelyGpx(bytes)).toBe(true);
  });

  it("returns false for plain text", () => {
    const bytes = new TextEncoder().encode("just some plain text, not GPX");
    expect(isLikelyGpx(bytes)).toBe(false);
  });

  it("returns false for an image's magic bytes", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
    expect(isLikelyGpx(bytes)).toBe(false);
  });

  it("returns false for an empty buffer", () => {
    expect(isLikelyGpx(new Uint8Array())).toBe(false);
  });
});
