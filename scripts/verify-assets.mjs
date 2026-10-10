import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { NodeIO, getBounds } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const manifest = JSON.parse(
  await readFile("public/models/manifest.json", "utf8"),
);
for (const [id, asset] of Object.entries(manifest.assets)) {
  const file = `public${asset.path}`;
  const doc = await io.read(file);
  const scene = doc.getRoot().listScenes()[0];
  assert.ok(scene, `${id}: missing scene`);
  const bounds = getBounds(scene);
  const actual = bounds.max.map((n, i) => n - bounds.min[i]);
  actual.forEach((n, i) =>
    assert.ok(
      Math.abs(n - asset.bounds[i]) < 0.002,
      `${id}: bounds changed on axis ${i}, expected ${asset.bounds[i]}, got ${n}`,
    ),
  );
  assert.ok(
    (await stat(file)).size < 75000,
    `${id}: exceeds compressed 75 KB asset budget`,
  );
  assert.ok(doc.getRoot().listMeshes().length > 0, `${id}: no geometry`);
  if (id.endsWith("-desk"))
    assert.ok(
      doc
        .getRoot()
        .listMaterials()
        .some((m) => m.getName() === "wood"),
      `${id}: missing finish material`,
    );
  console.log(`✓ ${id}: bounds, geometry, materials, and transfer budget`);
}
