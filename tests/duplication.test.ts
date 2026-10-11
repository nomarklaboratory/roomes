import { test } from "node:test";
import assert from "node:assert/strict";
import { catalog } from "../lib/catalog.ts";
import {
  duplicatePlacement,
  additionalInstanceFits,
} from "../lib/product-duplication.ts";
import { positionOf, clampPosition } from "../lib/placement.ts";
import { inspectionTargets } from "../lib/product-inspection.ts";
import type { History } from "../types/workspace.ts";
import {
  initialHistory,
  presetSetup,
  reducer,
  quote,
  decodeSaved,
  STORAGE_VERSION,
  allowedSlots,
} from "../lib/workspace.ts";

test("accessory copies get free positions, price quantities, persist and undo as one change", () => {
  for (const productId of [
    "ikea-fejka",
    "benq-wit",
    "torq-mod-fun",
    "logitech-mx-keys-mini",
  ]) {
    let state: History = {
      ...initialHistory(),
      present: { ...presetSetup("essentials"), items: [] },
    };
    state = reducer(state, { type: "add", productId, id: "source" });
    const before = state;
    assert.ok(duplicatePlacement(state.present, "source"));
    state = reducer(state, { type: "duplicate", id: "source", newId: "copy" });
    const copy = state.present.items.find((item) => item.id === "copy")!;
    assert.equal(copy.productId, productId);
    const targets = inspectionTargets(state.present);
    assert.equal(
      targets.find((target) => target.id === "source")?.label,
      `${catalog[productId].name} · 1`,
    );
    assert.equal(
      targets.find((target) => target.id === "copy")?.label,
      `${catalog[productId].name} · 2`,
    );
    assert.ok(additionalInstanceFits(before.present, copy));
    assert.notDeepEqual(
      positionOf(state.present, "source"),
      positionOf(state.present, "copy"),
    );
    assert.deepEqual(state.present.layout, before.present.layout);
    assert.equal(state.past.length, before.past.length + 1);
    assert.equal(
      quote(state.present).weeklyCents,
      quote(before.present).weeklyCents + catalog[productId].weeklyCents,
    );
    assert.deepEqual(
      decodeSaved(
        JSON.stringify({ version: STORAGE_VERSION, setup: state.present }),
      ),
      state.present,
    );
    assert.deepEqual(reducer(state, { type: "undo" }).present, before.present);
    state = reducer(state, { type: "reset-position", id: "copy" });
    assert.ok(
      additionalInstanceFits(
        {
          ...state.present,
          items: state.present.items.filter((item) => item.id !== "copy"),
        },
        state.present.items.find((item) => item.id === "copy")!,
      ),
    );
    const slot = allowedSlots(state.present, copy)[0];
    if (slot) state = reducer(state, { type: "move", id: "copy", slot });
    assert.equal(state.present.items.length, 2);
    assert.deepEqual(
      decodeSaved(
        JSON.stringify({ version: STORAGE_VERSION, setup: state.present }),
      ),
      state.present,
    );
    // Manual moves remain saved even when the user deliberately overlaps copies.
    state = reducer(state, {
      type: "place",
      id: "copy",
      position: positionOf(state.present, "source"),
    });
    assert.deepEqual(
      decodeSaved(
        JSON.stringify({ version: STORAGE_VERSION, setup: state.present }),
      ),
      state.present,
    );
  }
});

test("monitor copies respect real desk width, reflow into two positions, and cannot exceed two", () => {
  let state = initialHistory();
  const source = state.present.items.find(
    (item) => catalog[item.productId].kind === "monitor",
  )!;
  assert.equal(duplicatePlacement(state.present, source.id), null);
  assert.equal(
    reducer(state, { type: "duplicate", id: source.id, newId: "copy" }),
    state,
  );
  state = reducer(state, { type: "desk", id: "jarvis-laminate" });
  state = reducer(state, {
    type: "place",
    id: source.id,
    position: { x: 0, z: -0.29 },
  });
  const before = state;
  state = reducer(state, { type: "duplicate", id: source.id, newId: "copy" });
  const a = positionOf(state.present, source.id);
  const b = positionOf(state.present, "copy");
  assert.ok(Math.abs(a.x - b.x) >= catalog[source.productId].width + 0.04);
  assert.equal(
    quote(state.present).lines.find(
      (line) => line.product.id === source.productId,
    )?.quantity,
    2,
  );
  assert.equal(duplicatePlacement(state.present, source.id), null);
  assert.equal(
    reducer(state, { type: "duplicate", id: source.id, newId: "third" }),
    state,
  );
  assert.deepEqual(reducer(state, { type: "undo" }).present, before.present);
});

test("full surfaces, furniture, stale source IDs and duplicate IDs do not add copies or history", () => {
  let state = { ...initialHistory(), present: presetSetup("essentials") };
  const source = state.present.items[0];
  for (let n = 0; n < 20 && duplicatePlacement(state.present, source.id); n++) {
    state = reducer(state, {
      type: "duplicate",
      id: source.id,
      newId: `copy-${n}`,
    });
    for (const item of state.present.items)
      assert.deepEqual(
        clampPosition(
          state.present,
          item.id,
          positionOf(state.present, item.id),
        ),
        positionOf(state.present, item.id),
      );
  }
  assert.equal(duplicatePlacement(state.present, source.id), null);
  for (const id of [source.id, "desk", "chair", "removed"])
    assert.equal(
      reducer(state, { type: "duplicate", id, newId: "last-copy" }),
      state,
    );
  assert.equal(
    reducer(state, { type: "duplicate", id: source.id, newId: source.id }),
    state,
  );
});
