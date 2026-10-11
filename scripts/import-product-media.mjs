import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";

// Reuse the image processor installed by Next; no runtime supplier requests.
const sharp = createRequire(import.meta.resolve("next"))("sharp");
const sources = JSON.parse(
  await readFile("docs/product-media-sources.json", "utf8"),
);
const target = process.argv[2];
if (target && !sources[target]) throw new Error(`Unknown product: ${target}`);
const media = target
  ? { ...(await import("../lib/product-media-data.ts")).mediaByProduct }
  : {};
for (const [productId, entries] of Object.entries(sources)) {
  if (target && productId !== target) continue;
  await mkdir(`public/product-media/${productId}`, { recursive: true });
  media[productId] = [];
  for (const [index, entry] of entries.entries()) {
    const id = String(index);
    const base = {
      id,
      caption: entry.caption,
      variant: entry.variant,
      source: entry.url,
    };
    if (entry.kind === "video") {
      media[productId].push({
        ...base,
        kind: "video",
        src: entry.url,
        poster: `/product-media/${productId}/${entry.posterId}.webp`,
      });
      continue;
    }
    const bytes = execFileSync(
      "curl",
      ["-fsSL", "--retry", "2", "--max-time", "30", entry.url],
      { maxBuffer: 20 * 1024 * 1024 },
    );
    const src = `/product-media/${productId}/${id}.webp`;
    await sharp(bytes)
      .rotate()
      .resize({
        width: 1400,
        height: 1400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(`public${src}`);
    media[productId].push({
      ...base,
      kind: "image",
      presentation: entry.presentation,
      src,
      alt: `${entry.caption}. ${entry.variant}.`,
      ...(entry.finish ? { finish: entry.finish } : {}),
    });
    console.log(`${productId}/${id}: ${entry.caption}`);
  }
}
await writeFile(
  "lib/product-media-data.ts",
  `// Curated official sources: docs/product-media-sources.json. Rebuild with pnpm assets:media.\nimport type { ProductMedia } from "../types/catalog.ts";\n\nexport const mediaByProduct: Record<string, readonly ProductMedia[]> = ${JSON.stringify(media, null, 2)};\n`,
);
