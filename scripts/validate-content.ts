import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  loadAllContent,
  type ContentValidationError,
} from "../src/lib/content/loader";

const PUBLIC_ROOT = path.join(process.cwd(), "public");

async function validateHeroImage(
  file: string,
  heroImage: string,
  heroImageWidth: number,
  heroImageHeight: number,
): Promise<string[]> {
  const messages: string[] = [];
  const imagePath = path.join(PUBLIC_ROOT, heroImage.replace(/^\//, ""));

  if (!fs.existsSync(imagePath)) {
    messages.push(`Hero image not found on disk: ${heroImage}`);
    return messages;
  }

  try {
    const metadata = await sharp(imagePath).metadata();
    if (
      metadata.width !== heroImageWidth ||
      metadata.height !== heroImageHeight
    ) {
      messages.push(
        `Hero image dimensions mismatch: frontmatter says ${heroImageWidth}x${heroImageHeight}, actual file is ${metadata.width}x${metadata.height}`,
      );
    }
  } catch {
    messages.push(`Hero image could not be read: ${heroImage}`);
  }

  return messages;
}

const PLACEHOLDER_PATTERN = /placeholder/i;

/**
 * Seed content ships with obvious "Placeholder" markers so it can never
 * be mistaken for a real, reviewed piece. Once something is published,
 * none of that language should still be present — this is the backstop
 * that catches a status flip that forgot to also clean up the copy.
 */
function validatePlaceholderText(body: string, heroImageAlt: string): string[] {
  const messages: string[] = [];
  if (PLACEHOLDER_PATTERN.test(body)) {
    messages.push(
      "Published content still contains placeholder text in the body",
    );
  }
  if (PLACEHOLDER_PATTERN.test(heroImageAlt)) {
    messages.push("Published content still has a placeholder heroImageAlt");
  }
  return messages;
}

async function main() {
  const { editorial, collections, errors } = loadAllContent();
  const allErrors: ContentValidationError[] = [...errors];

  for (const item of editorial) {
    const messages = await validateHeroImage(
      item.file,
      item.frontmatter.heroImage,
      item.frontmatter.heroImageWidth,
      item.frontmatter.heroImageHeight,
    );
    if (item.frontmatter.status === "published") {
      messages.push(
        ...validatePlaceholderText(item.body, item.frontmatter.heroImageAlt),
      );
    }
    if (messages.length > 0) {
      allErrors.push({ file: item.file, messages });
    }
  }

  for (const item of collections) {
    const messages = await validateHeroImage(
      item.file,
      item.frontmatter.heroImage,
      item.frontmatter.heroImageWidth,
      item.frontmatter.heroImageHeight,
    );
    if (messages.length > 0) {
      allErrors.push({ file: item.file, messages });
    }
  }

  if (allErrors.length === 0) {
    const published = editorial.filter(
      (item) => item.frontmatter.status === "published",
    ).length;
    console.log(
      `Content validation passed: ${editorial.length} editorial item(s) (${published} published), ${collections.length} collection(s).`,
    );
    return;
  }

  console.error("Content validation failed:\n");
  const byFile = new Map<string, string[]>();
  for (const error of allErrors) {
    byFile.set(error.file, [
      ...(byFile.get(error.file) ?? []),
      ...error.messages,
    ]);
  }

  for (const [file, messages] of byFile) {
    console.error(file);
    for (const message of messages) {
      console.error(`- ${message}`);
    }
    console.error("");
  }

  process.exitCode = 1;
}

main();
