import { test } from "node:test";
import assert from "node:assert/strict";
import { catalog, products } from "../lib/catalog.ts";
import { positionOf } from "../lib/placement.ts";
import { normalize, presetSetup } from "../lib/workspace.ts";

test("published dimensions have dated sources and chosen adjustment heights stay in range", () => {
  for (const product of products) {
    assert.ok(
      [product.width, product.depth, product.height].every(
        (n) => Number.isFinite(n) && n > 0,
      ),
    );
    if (product.scale.status === "listed") {
      assert.ok(product.scale.source?.startsWith("https://"));
      assert.match(product.scale.checkedAt ?? "", /^\d{4}-\d{2}-\d{2}$/);
    }
    const range = product.scale.heightRange;
    if (range)
      assert.ok(product.height >= range[0] && product.height <= range[1]);
    const seatRange = product.scale.seatHeightRange;
    if (seatRange)
      assert.ok(
        product.seatHeight! >= seatRange[0] &&
          product.seatHeight! <= seatRange[1],
      );
    if (product.concept) assert.equal(product.scale.status, "concept");
  }
  assert.equal(catalog["laptop-stand"].scale.status, "estimated");
});

test("every accessory envelope fits the tabletop in default, quick, and migrated positions", () => {
  for (const deskId of ["electric-desk", "wooden-desk"]) {
    for (const product of products.filter((p) => p.category === "accessory")) {
      for (const slot of [
        "rear-left",
        "rear-center",
        "rear-right",
        "front-left",
        "front-center",
        "front-right",
      ] as const) {
        const setup = normalize({
          ...presetSetup("developer"),
          deskId,
          items: [{ id: "scale-check", productId: product.id, slot }],
        });
        for (const candidate of [
          setup,
          normalize({
            ...setup,
            items: setup.items.map((i) => ({
              ...i,
              position: { x: 99, z: -99 },
            })),
          }),
        ]) {
          const point = positionOf(candidate, "scale-check");
          const desk = catalog[deskId];
          assert.ok(
            Math.abs(point.x) + product.width / 2 <= desk.width / 2 - 0.014,
            `${product.id} width overhangs ${deskId}`,
          );
          assert.ok(
            Math.abs(point.z) + product.depth / 2 <= desk.depth / 2 - 0.014,
            `${product.id} depth overhangs ${deskId}`,
          );
        }
      }
    }
  }
});
