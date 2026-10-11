import { test } from "node:test";
import assert from "node:assert/strict";
import { productHoldAction } from "../lib/product-actions.ts";

test("the action wheel uses four directions with a neutral center and disabled editing actions", () => {
  const directions = [
    { x: 0, y: -84, action: "duplicate" },
    { x: 84, y: 0, action: "inspect" },
    { x: 0, y: 84, action: "delete" },
    { x: -84, y: 0, action: "move" },
  ] as const;
  for (const { x, y, action } of directions) {
    assert.equal(productHoldAction(x, y, true, true, true), action);
    assert.equal(
      productHoldAction(x, y, false, false, false),
      action === "inspect" ? "inspect" : null,
    );
  }
  assert.equal(productHoldAction(20, -20, true, true, true), null);
  assert.equal(productHoldAction(0, 84, true, false, true), null);
  assert.equal(productHoldAction(0, -84, true, true, false), null);
});
