import { test } from "node:test";
import assert from "node:assert/strict";
import {
  allowedSlots,
  baliToday,
  canAdd,
  decodeSaved,
  initialHistory,
  presetSetup,
  quote,
  reducer,
  validDeliveryDate,
} from "../lib/workspace.ts";
import {
  positionOf,
  walkBlocked,
  walkStart,
  walkStep,
} from "../lib/placement.ts";

test("free placement stays on its surface, moves desk contents together, and undoes atomically", () => {
  let state = initialHistory();
  const original = structuredClone(state.present);
  const monitor = state.present.items.find(
    (i) => i.productId === "monitor-27",
  )!;
  const local = positionOf(state.present, monitor.id);
  state = reducer(state, {
    type: "place",
    id: "desk",
    position: { x: 0.5, z: 0 },
  });
  assert.deepEqual(positionOf(state.present, monitor.id), local);
  assert.deepEqual(state.present.layout.desk, { x: 0.5, z: 0 });
  assert.equal(state.past.length, 1);
  state = reducer(state, { type: "undo" });
  assert.deepEqual(state.present, original);
  state = reducer(state, {
    type: "place",
    id: monitor.id,
    position: { x: 20, z: -20 },
  });
  const position = positionOf(state.present, monitor.id);
  assert.equal(position.x, 0.28);
  assert.equal(position.z, -0.185);
  state = reducer(state, {
    type: "place",
    id: "chair",
    position: { x: -20, z: 20 },
  });
  assert.deepEqual(state.present.layout.chair, { x: -1.34, z: 1.09 });
  const invalid = reducer(state, {
    type: "place",
    id: "desk",
    position: { x: NaN, z: 0 },
  });
  assert.equal(invalid, state);
});
test("layouts persist safely, older saved setups migrate, and desk changes clamp custom positions", () => {
  let state = initialHistory();
  state = reducer(state, { type: "desk", id: "wooden-desk" });
  const lamp = state.present.items.find((i) => i.productId === "desk-lamp")!;
  state = reducer(state, {
    type: "place",
    id: lamp.id,
    position: { x: 0.7, z: 0.3 },
  });
  state = reducer(state, {
    type: "place",
    id: "desk",
    position: { x: -0.5, z: 0.2 },
  });
  assert.deepEqual(
    decodeSaved(JSON.stringify({ version: 1, setup: state.present })),
    state.present,
  );
  state = reducer(state, { type: "desk", id: "electric-desk" });
  assert.deepEqual(positionOf(state.present, lamp.id), { x: 0.505, z: 0.205 });
  const legacy = { ...presetSetup("developer"), layout: undefined };
  assert.deepEqual(
    decodeSaved(JSON.stringify({ version: 1, setup: legacy }))?.layout,
    presetSetup("developer").layout,
  );
  const corrupt = {
    ...state.present,
    layout: { desk: { x: "bad", z: 0 }, chair: { x: 999, z: -999 } },
  };
  const decoded = decodeSaved(JSON.stringify({ version: 1, setup: corrupt }))!;
  assert.deepEqual(decoded.layout.desk, presetSetup("developer").layout.desk);
  assert.ok(Math.abs(decoded.layout.chair.x) < 1.5);
});
test("first-person walking is bounded and cannot cross furniture, with safe starting positions", () => {
  const setup = presetSetup("developer");
  const start = walkStart(setup);
  assert.equal(walkBlocked(setup, start), false);
  assert.equal(walkBlocked(setup, setup.layout.desk), true);
  let p = start;
  for (let n = 0; n < 100; n++) p = walkStep(setup, p, { x: 0, z: -0.02 });
  assert.ok(p.z > 0.8, "chair blocks walking straight through it");
  for (let n = 0; n < 100; n++) p = walkStep(setup, p, { x: -0.02, z: 0 });
  assert.ok(p.x >= -1.5);
  for (let n = 0; n < 100; n++) p = walkStep(setup, p, { x: 0, z: -0.02 });
  assert.ok(p.z >= -1.27);
  assert.equal(walkBlocked(setup, p), false);
});

test("a narrower desk removes the incompatible monitor and undo restores the whole configuration", () => {
  let state = initialHistory();
  state = reducer(state, { type: "desk", id: "wooden-desk" });
  state = reducer(state, {
    type: "add",
    productId: "monitor-27",
    id: "second-monitor",
  });
  assert.equal(
    state.present.items.filter((i) => i.productId === "monitor-27").length,
    2,
  );
  const wide = structuredClone(state.present);
  assert.equal(canAdd(wide, "monitor-27"), false);
  state = reducer(state, { type: "desk", id: "electric-desk" });
  assert.equal(
    state.present.items.filter((i) => i.productId === "monitor-27").length,
    1,
  );
  assert.match(state.notice, /removed to fit/);
  state = reducer(state, { type: "undo" });
  assert.deepEqual(state.present, wide);
});
test("accessory quantities and occupied placement slots cannot be bypassed", () => {
  let state = initialHistory();
  state = reducer(state, { type: "add", productId: "plant", id: "green" });
  state = reducer(state, { type: "add", productId: "plant", id: "duplicate" });
  assert.equal(
    state.present.items.filter((i) => i.productId === "plant").length,
    1,
  );
  const plant = state.present.items.find((i) => i.id === "green")!;
  const lamp = state.present.items.find((i) => i.productId === "desk-lamp")!;
  assert.ok(!allowedSlots(state.present, plant).includes(lamp.slot));
  const previous = state;
  state = reducer(state, { type: "move", id: "green", slot: lamp.slot });
  assert.equal(state, previous);
});
test("quotes group quantities and calculate weekly and term totals in integer cents", () => {
  let state = initialHistory();
  state = reducer(state, { type: "desk", id: "wooden-desk" });
  state = reducer(state, {
    type: "add",
    productId: "monitor-27",
    id: "second",
  });
  state = reducer(state, { type: "weeks", value: 8 });
  const total = quote(state.present);
  assert.equal(
    total.lines.find((l) => l.product.id === "monitor-27")!.quantity,
    2,
  );
  assert.equal(total.weeklyCents, 4200);
  assert.equal(total.totalCents, 33600);
  assert.equal(quote(presetSetup("developer")).totalCents, 10800);
});
test("corrupt and stale persistence is rejected, while unknown fields never survive hydration", () => {
  assert.equal(decodeSaved("{"), null);
  assert.equal(
    decodeSaved(
      JSON.stringify({ version: 0, setup: presetSetup("developer") }),
    ),
    null,
  );
  const setup = {
    ...presetSetup("creative"),
    name: "must not persist",
    items: [{ id: "bad", productId: "invented", slot: "rear-left" }],
  };
  assert.equal(decodeSaved(JSON.stringify({ version: 1, setup })), null);
  const decoded = decodeSaved(
    JSON.stringify({
      version: 1,
      setup: { ...presetSetup("creative"), name: "personal" },
    }),
  );
  assert.ok(decoded);
  assert.ok(!("name" in decoded));
});
test("requested dates use the Bali day boundary and reject impossible calendar dates", () => {
  const now = new Date("2026-10-10T16:30:00Z");
  assert.equal(baliToday(now), "2026-10-11");
  assert.equal(validDeliveryDate("2026-10-11", now), false);
  assert.equal(validDeliveryDate("2026-10-12", now), true);
  assert.equal(
    validDeliveryDate("2026-02-30", new Date("2026-01-01T00:00:00Z")),
    false,
  );
});
