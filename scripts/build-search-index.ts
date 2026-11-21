import fs from "node:fs";
import path from "node:path";
import { getPublishedEditorial } from "../src/lib/content/loader";
import { buildSearchIndex } from "../src/lib/search/build-index";

function main() {
  const index = buildSearchIndex(
    getPublishedEditorial(undefined, { includeDrafts: false }),
  );

  const outDir = path.join(process.cwd(), "public/search");
  const outFile = path.join(outDir, "index.json");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(index));

  console.log(`Wrote ${index.length} document(s) to public/search/index.json`);
}

main();
