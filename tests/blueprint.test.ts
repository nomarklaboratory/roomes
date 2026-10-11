import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createBlueprint,
  placementMeasurements,
  pointFromMeasurements,
} from "../lib/blueprint.ts";
import { placementSchema } from "../lib/placement-form.ts";
import { positionOf } from "../lib/placement.ts";
import {
  initialHistory,
  reducer,
  decodeSaved,
  STORAGE_VERSION,
} from "../lib/workspace.ts";
import { buildBlueprintPdf } from "../lib/blueprint-pdf.ts";

function populatedSetup() {
  let state = initialHistory();
  for (const productId of [
    "logitech-desk-mat",
    "logitech-mouse-pad",
    "logitech-mx-master-3s",
    "torq-mod-fun",
  ])
    state = reducer(state, { type: "add", id: productId, productId });
  return state.present;
}
test("room, desktop and wall measurements round-trip through the renderer's coordinate frames", () => {
  const setup = populatedSetup();
  for (const id of ["desk", "chair", ...setup.items.map((item) => item.id)]) {
    const measurements = placementMeasurements(setup, id);
    const restored = pointFromMeasurements(setup, id, measurements);
    const point = positionOf(setup, id);
    assert.ok(Math.abs(point.x - restored.x) <= 0.00051);
    assert.ok(Math.abs(point.z - restored.z) <= 0.00051);
    if (point.y !== undefined)
      assert.ok(Math.abs(point.y - restored.y!) <= 0.00051);
  }
  const blueprint = createBlueprint(setup, "2026-10-12T00:00:00Z");
  assert.equal(blueprint.items.length, setup.items.length + 2);
  assert.deepEqual(
    blueprint.items.map((item) => item.number),
    blueprint.items.map((_, i) => i + 1),
  );
  const wall = blueprint.views.find((view) => view.id === "wall")!;
  const board = wall.footprints[0];
  assert.equal(board.y, wall.height - board.item.offset - board.height);
  assert.equal(
    blueprint.views[0].footprints.find((item) => item.item.id === "chair")
      ?.facing,
    "up",
  );
});
test("moving the desk keeps accessory offsets and mat stacking, and Undo/restoration reproduce the same blueprint", () => {
  const setup = populatedSetup();
  const before = createBlueprint(setup, "fixed");
  const measurements = placementMeasurements(setup, "desk");
  const moved = reducer(
    { past: [], present: setup, notice: "" },
    {
      type: "place",
      id: "desk",
      position: pointFromMeasurements(setup, "desk", {
        ...measurements,
        left: measurements.left + 10,
      }),
    },
  );
  const after = createBlueprint(moved.present, "fixed");
  assert.deepEqual(
    after.items.filter((item) => item.view === "desk"),
    before.items.filter((item) => item.view === "desk"),
  );
  const mouse = after.items.find(
    (item) => item.id === "logitech-mx-master-3s",
  )!;
  assert.ok(mouse.surfaceHeight > after.items[0].height);
  assert.deepEqual(
    createBlueprint(reducer(moved, { type: "undo" }).present, "fixed"),
    before,
  );
  const restored = decodeSaved(
    JSON.stringify({ version: STORAGE_VERSION, setup: moved.present }),
  )!;
  assert.deepEqual(createBlueprint(restored, "fixed"), after);
});
test("precise placement rejects blank and out-of-surface inputs without changing the setup", () => {
  const setup = populatedSetup();
  for (const id of ["desk", "logitech-mx-master-3s", "torq-mod-fun"]) {
    const values = placementMeasurements(setup, id);
    const schema = placementSchema(setup, id);
    assert.ok(
      schema.safeParse({
        left: String(values.left),
        offset: String(values.offset),
      }).success,
    );
    assert.equal(schema.safeParse({ left: "", offset: "20" }).success, false);
    assert.equal(schema.safeParse({ left: "-1", offset: "20" }).success, false);
    assert.equal(
      schema.safeParse({ left: "9999", offset: "20" }).success,
      false,
    );
  }
});
test("PDF stays vector, includes every numbered item and omits empty wall views", () => {
  const simple = createBlueprint(initialHistory().present);
  assert.deepEqual(
    simple.views.map((view) => view.id),
    ["room", "desk"],
  );
  const blueprint = createBlueprint(populatedSetup());
  const doc = buildBlueprintPdf(blueprint);
  assert.equal(
    doc.getNumberOfPages(),
    blueprint.views.length + Math.ceil(blueprint.items.length / 5),
  );
  const output = doc.output();
  assert.ok(output.startsWith("%PDF"));
  assert.ok(output.includes("Back wall"));
  assert.ok(output.includes("Bottom from floor"));
  assert.ok(output.includes("Surface height"));
  assert.equal(output.includes("/Subtype /Image"), false);
  assert.equal(output.includes("rental-request"), false);
});
