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
