import { test } from "node:test";
import assert from "node:assert/strict";
import { catalog } from "../lib/catalog.ts";
import { accessorySurfaceHeight, positionOf } from "../lib/placement.ts";
import {
  initialHistory,
  reducer,
  decodeSaved,
  quote,
  STORAGE_VERSION,
} from "../lib/workspace.ts";
import { rentalRequest } from "../lib/checkout.ts";

const extras = [
  "ikea-fejka",
  "twelve-south-curve",
  "torq-mod-fun",
  "logitech-desk-mat",
  "logitech-mouse-pad",
  "logitech-mx-keys-mini",
  "logitech-mx-master-3s",
  "elgato-stream-deck-mk2",
];
function completeSetup() {
  return extras.reduce(
    (state, productId) =>
      reducer(state, { type: "add", productId, id: productId }),
    initialHistory(),
  );
}

test("desk input accessories coexist with all existing props, hydrate and undo without losing placement slots", () => {
  const state = completeSetup();
  assert.equal(state.present.items.length, 10);
  assert.ok(
    state.present.items.every(
      (item) => typeof item.slot === "string" && item.slot.length,
    ),
  );
  assert.equal(
    new Set(state.present.items.map((item) => item.slot)).size,
    state.present.items.length,
  );
  assert.deepEqual(
    decodeSaved(
      JSON.stringify({ version: STORAGE_VERSION, setup: state.present }),
    ),
    state.present,
  );
  const removed = reducer(state, {
    type: "remove",
    id: "logitech-mx-keys-mini",
  });
  assert.equal(removed.present.items.length, 9);
  assert.deepEqual(reducer(removed, { type: "undo" }).present, state.present);
});

test("mouse and keyboard rest on mats, and moving away or removing a mat updates the support height", () => {
  const state = completeSetup();
  const setup = state.present;
  const base = catalog[setup.deskId].height;
  assert.equal(accessorySurfaceHeight(setup, "logitech-desk-mat"), base);
  assert.equal(
    accessorySurfaceHeight(setup, "logitech-mouse-pad"),
    base + 0.002,
  );
  assert.equal(
    accessorySurfaceHeight(setup, "logitech-mx-keys-mini"),
    base + 0.002,
  );
  assert.equal(
    accessorySurfaceHeight(setup, "logitech-mx-master-3s"),
    base + 0.004,
  );
  assert.equal(
    accessorySurfaceHeight(setup, "logitech-mx-master-3s", {
      x: 0.45,
      z: -0.2,
    }),
    base,
  );
  const moved = reducer(state, {
    type: "place",
    id: "logitech-mx-master-3s",
    position: { x: 0.45, z: -0.2 },
  });
  assert.equal(
    accessorySurfaceHeight(moved.present, "logitech-mx-master-3s"),
    base,
  );
  const withoutPad = reducer(state, {
    type: "remove",
    id: "logitech-mouse-pad",
  });
  assert.equal(
    accessorySurfaceHeight(withoutPad.present, "logitech-mx-master-3s"),
    base + 0.002,
  );
  const withoutMat = reducer(withoutPad, {
    type: "remove",
    id: "logitech-desk-mat",
  });
  assert.equal(
    accessorySurfaceHeight(withoutMat.present, "logitech-mx-master-3s"),
    base,
  );
  assert.deepEqual(
    positionOf(withoutMat.present, "logitech-mx-master-3s"),
    positionOf(setup, "logitech-mx-master-3s"),
  );
});

test("rental requests use the current setup and duration with grouped quantities and integer-cent prices", () => {
  const state = reducer(completeSetup(), { type: "weeks", value: 8 });
  const setup = state.present;
  const delivery = {
    name: "Alex",
    email: "alex@example.com",
    phone: "+628123456789",
    area: "Canggu",
    address: "Jalan Test 1",
    date: "2026-12-01",
    notes: "",
  };
  const request = rentalRequest(setup, delivery);
  assert.deepEqual(request.delivery, delivery);
  assert.equal(request.status, "rental-request");
  assert.deepEqual(request.setup, setup);
  assert.equal(
    request.products.reduce((sum, product) => sum + product.quantity, 0),
    quote(setup).count,
  );
  assert.equal(
    request.totalCents,
    request.products.reduce((sum, product) => sum + product.weeklyCents, 0) * 8,
  );
  assert.equal(request.currency, "USD");
});
