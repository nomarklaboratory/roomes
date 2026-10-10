import { execFileSync } from "node:child_process";
import { readFile, rename, stat, writeFile } from "node:fs/promises";
const path = "public/models/manifest.json";
const manifest = JSON.parse(await readFile(path, "utf8"));
for (const [id, asset] of Object.entries(manifest.assets)) {
  const input = `public/models/${id}.glb`,
    output = `public/models/${id}.optimized.glb`;
  // Keep semantic materials (especially wood) for runtime variants. No palette conversion.
  execFileSync(
    "pnpm",
    [
      "exec",
      "gltf-transform",
      "optimize",
      input,
      output,
      "--compress",
      "meshopt",
      "--flatten",
      "false",
      "--join",
      "false",
      "--palette",
      "false",
      "--instance",
      "false",
      "--simplify",
      "false",
      "--texture-compress",
      "false",
    ],
    { stdio: "pipe" },
  );
  await rename(output, input);
  asset.bytes = (await stat(input)).size;
  asset.compression = "meshopt";
  console.log(`${id}: ${(asset.bytes / 1024).toFixed(1)} KB`);
}
await writeFile(path, JSON.stringify(manifest, null, 2) + "\n");
