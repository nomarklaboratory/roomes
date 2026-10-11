import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { NodeIO, getBounds } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
import { catalog } from "../lib/catalog.ts";
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const manifest = JSON.parse(
  await readFile("public/models/manifest.json", "utf8"),
);
assert.deepEqual(
  Object.keys(manifest.assets).sort(),
  Object.keys(catalog).sort(),
  "Every catalog item needs a calibrated asset",
);
assert.equal(manifest.units, "meters");
for (const [id, asset] of Object.entries(manifest.assets)) {
  const product = catalog[id];
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
  const expected = [product.width, product.height, product.depth];
  actual.forEach((n, i) =>
    assert.ok(
      Math.abs(n - expected[i]) < 0.002,
      `${id}: geometry axis ${i} must match catalog metres: ${n} vs ${expected[i]}`,
    ),
  );
  assert.equal(
    asset.version,
    product.assetVersion ?? 1,
    `${id}: cache version mismatch`,
  );
  assert.deepEqual(
    asset.scale,
    product.scale,
    `${id}: measurement provenance mismatch`,
  );
  assert.ok(
    Math.abs(bounds.min[1]) < 0.001,
    `${id}: base must rest on its surface at Y=0`,
  );
  for (const axis of [0, 2])
    assert.ok(
      Math.abs(bounds.min[axis] + bounds.max[axis]) < 0.002,
      `${id}: footprint must be centered on its placement origin`,
    );
  assert.ok(
    (await stat(file)).size < 75000,
    `${id}: exceeds compressed 75 KB asset budget`,
  );
  assert.ok(doc.getRoot().listMeshes().length > 0, `${id}: no geometry`);
  if (catalog[id].category === "desk" || catalog[id].category === "chair") {
    assert.ok(
      Math.abs(bounds.min[1]) < 0.001,
      `${id}: feet must touch the ground`,
    );
    assert.ok(
      Math.abs(bounds.max[1] - catalog[id].height) < 0.01,
      `${id}: catalog height must match the grounded geometry`,
    );
  }
  if (catalog[id].category === "chair") {
    const seat = doc
      .getRoot()
      .listNodes()
      .find((node) => node.getName() === "seat");
    assert.ok(seat, `${id}: missing seat anchor geometry`);
    assert.ok(
      Math.abs(getBounds(seat).max[1] - catalog[id].seatHeight) < 0.001,
      `${id}: seat geometry must match the seated camera height`,
    );
    if (product.seat) {
      const seatBounds = getBounds(seat);
      assert.ok(
        Math.abs(seatBounds.max[0] - seatBounds.min[0] - product.seat.width) <
          0.002,
        `${id}: seat width must match catalog`,
      );
      assert.ok(
        Math.abs(seatBounds.max[2] - seatBounds.min[2] - product.seat.depth) <
          0.002,
        `${id}: seat depth must match catalog`,
      );
    }
  }
  if (product.screen) {
    const screen = doc
      .getRoot()
      .listNodes()
      .find((n) => n.getName() === "active-screen");
    assert.ok(screen, `${id}: missing screen geometry`);
    const b = getBounds(screen);
    const chord = b.max[0] - b.min[0];
    const w = product.screen.radius
        ? 2 *
          product.screen.radius *
          Math.asin(chord / (2 * product.screen.radius))
        : chord,
      h = b.max[1] - b.min[1];
    assert.ok(
      Math.abs(Math.hypot(w, h) / 0.0254 - product.screen.inches) < 0.1,
      `${id}: inch size refers to the screen diagonal, not stand height`,
    );
    assert.ok(
      Math.abs(w / h - product.screen.aspect) < 0.01,
      `${id}: incorrect screen aspect ratio`,
    );
  }
  if (product.category === "desk") {
    const top = doc
      .getRoot()
      .listNodes()
      .find((n) => n.getName() === "tabletop");
    assert.ok(top, `${id}: missing tabletop anchor`);
    assert.ok(
      Math.abs(getBounds(top).max[1] - product.height) < 0.001,
      `${id}: accessories must meet the tabletop surface`,
    );
  }
  if (product.category === "desk")
    assert.ok(
      doc
        .getRoot()
        .listMaterials()
        .some((m) => m.getName() === "wood"),
      `${id}: missing finish material`,
    );
  console.log(`✓ ${id}: bounds, geometry, materials, and transfer budget`);
}
