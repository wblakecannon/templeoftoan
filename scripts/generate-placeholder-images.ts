import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { loadAllContent } from "../src/lib/content/loader";

// Generates temple-black/blood-red stand-in hero images for any editorial
// piece whose heroImage file does not exist yet. Real photography replaces
// these. Never overwrites an existing file.
const HERO_WIDTH = 2400;
const HERO_HEIGHT = 1600;
const PUBLIC_ROOT = path.join(process.cwd(), "public");

function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

async function main() {
  const { editorial, collections } = loadAllContent();
  const targets = [
    ...editorial.map((i) => ({
      file: i.frontmatter.heroImage,
      label: i.frontmatter.title,
    })),
    ...collections.map((i) => ({
      file: i.frontmatter.heroImage,
      label: i.frontmatter.title,
    })),
  ];
  let created = 0;
  for (const { file, label } of targets) {
    const out = path.join(PUBLIC_ROOT, file.replace(/^\//, ""));
    if (fs.existsSync(out)) continue;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${HERO_WIDTH}" height="${HERO_HEIGHT}">
<rect width="100%" height="100%" fill="#0a0809"/>
<polygon points="1200,150 1500,1600 900,1600" fill="#8a0f1a" opacity="0.35"/>
<circle cx="1200" cy="620" r="260" fill="none" stroke="#d3141f" stroke-width="10"/>
<text x="1200" y="1250" text-anchor="middle" font-family="Georgia, serif" font-size="110" fill="#e8e1d1">${escapeXml(label)}</text>
</svg>`;
    await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(out);
    created += 1;
  }
  console.log(`Generated ${created} stand-in hero image(s).`);
}

main();
