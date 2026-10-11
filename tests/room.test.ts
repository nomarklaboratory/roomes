import { test } from "node:test";
import assert from "node:assert/strict";
import { catalog } from "../lib/catalog.ts";
import { defaultRoom, roomLimits, validRoom, wallZ } from "../lib/room.ts";
import {
  clampPosition,
  positionOf,
  walkBlocked,
  walkStart,
  walkStep,
} from "../lib/placement.ts";
import {
  decodeSaved,
  initialHistory,
  normalize,
  presetSetup,
  reducer,
  STORAGE_VERSION,
} from "../lib/workspace.ts";

test("room resizing preserves physical product sizes, clamps placement, persists, and undoes together", () => {
  let state = reducer(initialHistory(), {
    type: "room",
    dimensions: { width: 7, depth: 6, height: 3.2 },
  });
  state = reducer(state, {
    type: "place",
    id: "desk",
    position: { x: 2.5, z: -2.3 },
  });
  const before = state.present;
  state = reducer(state, {
    type: "room",
    dimensions: { width: 2.4, depth: 2.4, height: 2.2 },
  });
  assert.equal(catalog[state.present.deskId].width, 1.2);
  for (const id of ["desk", "chair"] as const) {
    const p =
      catalog[id === "desk" ? state.present.deskId : state.present.chairId];
    const at = state.present.layout[id];
    assert.ok(Math.abs(at.x) + p.width / 2 <= 1.08);
    assert.ok(Math.abs(at.z) + p.depth / 2 <= 1.08);
  }
  assert.deepEqual(
    decodeSaved(
      JSON.stringify({ version: STORAGE_VERSION, setup: state.present }),
    ),
    state.present,
  );
  assert.deepEqual(reducer(state, { type: "undo" }).present, before);
  const preset = reducer(state, { type: "preset", id: "creative" }).present;
  assert.deepEqual(preset.room, state.present.room);
  const legacy = { ...before, room: undefined };
  for (const version of [1, 2])
    assert.deepEqual(
      decodeSaved(JSON.stringify({ version, setup: legacy }))?.room,
      defaultRoom(),
    );
  for (const bad of [NaN, Infinity, 0, -3, 11])
    assert.equal(
      reducer(state, {
        type: "room",
        dimensions: { width: bad, depth: 3, height: 2.5 },
      }),
      state,
    );
  assert.equal(validRoom({ width: "3", depth: 3, height: 2.5 }), false);
});

test("wall surfboard has independent X/Y placement, stays in the wall bounds, and survives room/desk changes", () => {
  let state = reducer(initialHistory(), {
    type: "add",
    productId: "torq-mod-fun",
    id: "board",
  });
  const original = positionOf(state.present, "board");
  assert.equal(
    state.present.items.find((i) => i.id === "board")?.slot,
    "wall-center",
  );
  state = reducer(state, {
    type: "place",
    id: "desk",
    position: { x: 0.5, z: 0 },
  });
  assert.deepEqual(positionOf(state.present, "board"), original);
  state = reducer(state, {
    type: "place",
    id: "board",
    position: { x: 99, y: 99, z: 99 },
  });
  state = reducer(state, {
    type: "room",
    dimensions: { width: 2.4, depth: 2.8, height: 2.2 },
  });
  const point = positionOf(state.present, "board"),
    board = catalog["torq-mod-fun"];
  assert.ok(Math.abs(point.x) + board.width / 2 <= 1.081);
  assert.ok(point.y! + board.height <= state.present.room.height - 0.099);
  assert.equal(point.z, wallZ(state.present.room) + board.depth / 2 + 0.025);
  assert.deepEqual(
    decodeSaved(
      JSON.stringify({ version: STORAGE_VERSION, setup: state.present }),
    ),
    state.present,
  );
  for (const productId of ["ikea-fejka", "twelve-south-curve"])
    state = reducer(state, { type: "add", productId, id: productId });
  assert.equal(state.present.items.length, 5);
  assert.equal(new Set(state.present.items.map((i) => i.slot)).size, 5);
  assert.deepEqual(
    clampPosition(state.present, "board", { x: 0, y: NaN, z: 0 }),
    point,
  );
});

test("first-person movement respects custom floor dimensions and finds an unblocked start", () => {
  for (const width of [roomLimits.width[0], 3.6, roomLimits.width[1]]) {
    for (const depth of [roomLimits.depth[0], 3.1, roomLimits.depth[1]]) {
      const setup = normalize({
        ...presetSetup("creative"),
        room: { width, depth, height: 2.65 },
      });
      const start = walkStart(setup);
      assert.equal(walkBlocked(setup, start), false);
      assert.equal(walkBlocked(setup, { x: width / 2, z: 0 }), true);
      const next = walkStep(setup, start, { x: 99, z: 99 });
      assert.equal(walkBlocked(setup, next), false);
      assert.ok(Math.abs(next.x) <= width / 2 - 0.3);
      assert.ok(Math.abs(next.z) <= depth / 2 - 0.28);
    }
  }
});
