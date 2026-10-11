import { test } from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { products, catalog, productHero } from "../lib/catalog.ts";
import {
  decodeSaved,
  initialHistory,
  reducer,
  STORAGE_VERSION,
} from "../lib/workspace.ts";
import {
  inspectionMedia,
  inspectionTargets,
} from "../lib/product-inspection.ts";
import { migrateFinish, migrateProductId } from "../lib/catalog-migration.ts";

test("legacy product and finish migration preserves instance IDs, valid placement, and duration", () => {
  const legacy = {
    presetId: "creative",
    deskId: "wooden-desk",
    chairId: "task-chair",
    finish: "walnut",
    weeks: 8,
    layout: { desk: { x: -0.25, z: -0.3 }, chair: { x: 0.4, z: 0.6 } },
    items: [
      {
        id: "my-screen",
        productId: "monitor-34",
        slot: "rear-center",
        position: { x: 0.1, z: -0.1 },
      },
      {
        id: "my-plant",
        productId: "plant",
        slot: "front-left",
        position: { x: -0.35, z: 0.15 },
      },
    ],
  };
  const setup = decodeSaved(JSON.stringify({ version: 1, setup: legacy }))!;
  assert.equal(setup.deskId, "jarvis-laminate");
  assert.equal(setup.chairId, "herman-miller-sayl");
  assert.equal(setup.finish, "white");
  assert.equal(setup.weeks, 8);
  assert.deepEqual(setup.layout, legacy.layout);
  assert.deepEqual(
    setup.items.map((item) => ({ id: item.id, position: item.position })),
    legacy.items.map((item) => ({ id: item.id, position: item.position })),
  );
  assert.deepEqual(
    setup.items.map((item) => item.productId),
    ["dell-u3425we", "ikea-fejka"],
  );
  assert.deepEqual(
    decodeSaved(JSON.stringify({ version: STORAGE_VERSION, setup })),
    setup,
  );
  for (const invalid of ["constructor", "toString", "__proto__", "invented"]) {
    assert.equal(migrateProductId(invalid), undefined);
    assert.equal(migrateFinish(invalid), undefined);
  }
});

test("every legacy product has one real replacement", () => {
  const legacy = [
    "electric-desk",
    "wooden-desk",
    "ergonomic-chair",
    "task-chair",
    "monitor-27",
    "monitor-34",
    "desk-lamp",
    "plant",
    "laptop-stand",
  ];
  const migrated = legacy.map(migrateProductId);
  assert.equal(new Set(migrated).size, legacy.length);
  assert.ok(migrated.every((id) => id && catalog[id].source));
});

test("finish constraints, media, desk replacement and undo agree", () => {
  let state = reducer(initialHistory(), {
    type: "desk",
    id: "jarvis-laminate",
  });
  assert.equal(state.present.finish, "white");
  state = reducer(state, { type: "finish", value: "black" });
  const before = state.present;
  assert.equal(
    productHero(catalog[before.deskId], before.finish)?.finish,
    "black",
  );
  assert.ok(
    inspectionMedia(catalog[before.deskId], "black").every(
      (media) => !media.finish || media.finish === "black",
    ),
  );
  state = reducer(state, { type: "desk", id: "jarvis-bamboo" });
  assert.equal(state.present.finish, "bamboo");
  assert.equal(inspectionTargets(state.present)[0].product.id, "jarvis-bamboo");
  state = reducer(state, { type: "undo" });
  assert.deepEqual(state.present, before);
  const incompatible = reducer(state, { type: "finish", value: "bamboo" });
  assert.equal(incompatible, state);
});

test("curated media has unique IDs, official attribution and existing local images/posters", async () => {
  for (const product of products) {
    assert.ok(product.brand && product.model && product.media.length >= 2);
    assert.equal(
      new Set(product.media.map((media) => media.id)).size,
      product.media.length,
    );
    assert.ok(productHero(product));
    for (const media of product.media) {
      assert.ok(
        media.caption && media.variant && media.source.startsWith("https://"),
      );
      if (media.kind === "image") {
        assert.ok(media.alt && media.src.startsWith("/product-media/"));
        await access(`public${media.src}`);
      } else {
        assert.ok(media.src.startsWith("https://"));
        await access(`public${media.poster}`);
      }
    }
  }
});
