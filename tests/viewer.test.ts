import { test } from "node:test";
import assert from "node:assert/strict";
import { catalog } from "../lib/catalog.ts";
import { presetSetup } from "../lib/workspace.ts";
import { walkBlocked } from "../lib/placement.ts";
import {
  eyeHeight,
  person,
  seatedPosition,
  standUpPosition,
} from "../lib/viewer.ts";

test("a 170 cm person's camera uses eye height and the actual chair seat height", () => {
  for (const chairId of ["herman-miller-sayl", "herman-miller-aeron"]) {
    const setup = { ...presetSetup("developer"), chairId };
    assert.equal(person.height, 1.7);
    assert.equal(eyeHeight(setup, "standing"), 1.59);
    assert.equal(
      eyeHeight(setup, "seated"),
      chairId === "herman-miller-aeron" ? 1.23 : 1.199,
    );
    assert.equal(
      eyeHeight(setup, "seated") - catalog[chairId].seatHeight!,
      person.seatedEyeAboveSeat,
    );
  }
});
test("sitting follows the moved chair and standing up always chooses a free floor position", () => {
  const setup = presetSetup("creative");
  setup.layout.chair = { x: -0.7, z: 0.5 };
  assert.deepEqual(seatedPosition(setup), { x: -0.7, z: 0.54 });
  assert.equal(walkBlocked(setup, standUpPosition(setup)), false);
  for (const chair of [
    { x: -1.3, z: -1 },
    { x: 1.3, z: 1 },
    { x: 0, z: 0 },
  ]) {
    setup.layout.chair = chair;
    assert.equal(walkBlocked(setup, standUpPosition(setup)), false);
  }
});
