import { catalog } from "./catalog.ts";
import { walkBlocked, walkStart, type Point } from "./placement.ts";
import type { Setup } from "./workspace.ts";
import type { Posture } from "@/types/viewer";
// Representative proportions, not individual measurements. Calibration and
// source are recorded in docs/viewer.md. Stature is not the camera's eye height.
export const person = {
  height: 1.7,
  standingEyeHeight: 1.59,
  seatedEyeAboveSeat: 0.78,
} as const;
export function eyeHeight(setup: Setup, posture: Posture) {
  return posture === "standing"
    ? person.standingEyeHeight
    : (catalog[setup.chairId].seatHeight ?? 0.46) + person.seatedEyeAboveSeat;
}
export function seatedPosition(setup: Setup): Point {
  // Both chair assets face -Z in the room. The eyes sit over the cushion,
  // forward of the backrest, rather than behind/inside the chair mesh.
  return { x: setup.layout.chair.x, z: setup.layout.chair.z + 0.04 };
}
export function standUpPosition(setup: Setup): Point {
  const chair = setup.layout.chair;
  const offset =
    Math.max(catalog[setup.chairId].width, catalog[setup.chairId].depth) / 2 +
    0.26;
  return (
    [
      { x: chair.x - offset, z: chair.z },
      { x: chair.x + offset, z: chair.z },
      { x: chair.x, z: chair.z + offset },
      { x: chair.x, z: chair.z - offset },
    ].find((p) => !walkBlocked(setup, p)) ?? walkStart(setup)
  );
}
