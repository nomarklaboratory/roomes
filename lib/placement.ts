import { catalog } from "./catalog.ts";
import type { Item, Setup } from "./workspace.ts";
import { stoolPosition, wallZ } from "./room.ts";
import { accessoryHome, isMat } from "./accessory-placement.ts";

// All coordinates are metres. Accessories use the desk's local X/Z plane;
// furniture uses the room floor. Wall items use world X/Y with a fixed Z.
import type { Point, Layout, PlacementBounds } from "../types/placement.ts";
export type { Point, Layout } from "../types/placement.ts";
export const defaultLayout = (): Layout => ({
  desk: { x: 0, z: -0.43 },
  chair: { x: 0.16, z: 0.35 },
});
export function isPoint(value: unknown): value is Point {
  if (!value || typeof value !== "object") return false;
  const p = value as Point;
  return (
    Number.isFinite(p.x) &&
    Number.isFinite(p.z) &&
    (p.y === undefined || Number.isFinite(p.y))
  );
}
const clamp = (n: number, min: number, max: number) =>
  Math.round(Math.max(min, Math.min(max, n)) * 1000) / 1000;

function slotSide(slot: string) {
  if (slot.endsWith("left")) return -1;
  if (slot.endsWith("right")) return 1;
  return 0;
}
export function productFor(setup: Setup, id: string) {
  if (id === "desk") return catalog[setup.deskId];
  if (id === "chair") return catalog[setup.chairId];
  const item = setup.items.find((item) => item.id === id);
  return item ? catalog[item.productId] : undefined;
}
export function slotPosition(setup: Setup, item: Item): Point {
  const desk = catalog[setup.deskId];
  const product = catalog[item.productId];
  if (product.mount === "back-wall")
    return {
      x: 0,
      y: setup.room.height - product.height - 0.25,
      z: wallZ(setup.room) + product.depth / 2 + 0.025,
    };
  const home = accessoryHome(product, desk);
  if (home) return home;
  const rear = item.slot.startsWith("rear");
  const side = slotSide(item.slot);
  return {
    x: side * (desk.width / 2 - product.width / 2 - 0.015),
    z: rear
      ? -desk.depth / 2 + product.depth / 2 + 0.015
      : desk.depth / 2 - product.depth / 2 - 0.015,
  };
}
export function positionOf(setup: Setup, id: string): Point {
  if (id === "desk" || id === "chair") return setup.layout[id];
  const item = setup.items.find((i) => i.id === id);
  return item ? (item.position ?? slotPosition(setup, item)) : { x: 0, z: 0 };
}
export function accessorySurfaceHeight(
  setup: Setup,
  id: string,
  point = positionOf(setup, id),
) {
  const product = productFor(setup, id);
  let height = catalog[setup.deskId].height;
  if (product?.kind === "desk-mat") return height;
  for (const item of setup.items) {
    const mat = catalog[item.productId];
    if (item.id === id || !isMat(mat)) continue;
    if (product?.kind === "mouse-pad" && mat.kind !== "desk-mat") continue;
    const center = positionOf(setup, item.id);
    if (
      Math.abs(point.x - center.x) <= mat.width / 2 &&
      Math.abs(point.z - center.z) <= mat.depth / 2
    )
      height += mat.height;
  }
  return height;
}
export function placementBounds(
  setup: Setup,
  id: string,
): PlacementBounds | null {
  const product = productFor(setup, id);
  if (!product) return null;
  const desk = catalog[setup.deskId];
  if (product.mount === "back-wall") {
    return {
      x: [
        -setup.room.width / 2 + product.width / 2 + 0.12,
        setup.room.width / 2 - product.width / 2 - 0.12,
      ],
      y: [0.1, setup.room.height - product.height - 0.1],
      z: [
        wallZ(setup.room) + product.depth / 2 + 0.025,
        wallZ(setup.room) + product.depth / 2 + 0.025,
      ],
    };
  }
  const halfX =
    id === "desk" || id === "chair"
      ? setup.room.width / 2 - 0.12
      : desk.width / 2;
  const halfZ =
    id === "desk" || id === "chair"
      ? setup.room.depth / 2 - 0.12
      : desk.depth / 2;
  const insetX = product.width / 2 + 0.015;
  const insetZ = product.depth / 2 + 0.015;
  return {
    x: [-halfX + insetX, halfX - insetX],
    z: [-halfZ + insetZ, halfZ - insetZ],
  };
}
export function clampPosition(setup: Setup, id: string, point: Point): Point {
  const bounds = placementBounds(setup, id);
  if (!bounds || !isPoint(point)) return positionOf(setup, id);
  const result: Point = {
    x: clamp(point.x, ...bounds.x),
    z: clamp(point.z, ...bounds.z),
  };
  if (bounds.y) {
    result.z = bounds.z[0];
    result.y = clamp(point.y ?? positionOf(setup, id).y ?? 1.6, ...bounds.y);
  }
  return result;
}
export function walkBlocked(setup: Setup, point: Point) {
  if (
    !isPoint(point) ||
    Math.abs(point.x) > setup.room.width / 2 - 0.3 ||
    Math.abs(point.z) > setup.room.depth / 2 - 0.28
  )
    return true;
  return [
    {
      point: setup.layout.desk,
      width: catalog[setup.deskId].width,
      depth: catalog[setup.deskId].depth,
    },
    {
      point: setup.layout.chair,
      width: catalog[setup.chairId].width,
      depth: catalog[setup.chairId].depth,
    },
    { point: stoolPosition(setup.room), width: 0.4, depth: 0.4 },
  ].some(
    ({ point: p, width, depth }) =>
      Math.abs(point.x - p.x) < width / 2 + 0.14 &&
      Math.abs(point.z - p.z) < depth / 2 + 0.14,
  );
}
export function walkStart(setup: Setup): Point {
  const x = setup.room.width / 2 - 0.31,
    z = setup.room.depth / 2 - 0.29;
  const candidates = [
    { x: 0, z },
    { x: -x, z },
    { x, z },
    { x: -x, z: 0 },
    { x, z: 0 },
    { x: 0, z: -z },
  ];
  // Search the perimeter as well when a small room has furniture near a corner.
  for (let i = 0; i <= 10; i++) {
    const t = i / 5 - 1;
    candidates.push(
      { x: t * x, z },
      { x: t * x, z: -z },
      { x, z: t * z },
      { x: -x, z: t * z },
    );
  }
  return candidates.find((p) => !walkBlocked(setup, p)) ?? { x: 0, z };
}
export function walkStep(setup: Setup, from: Point, delta: Point): Point {
  const halfX = setup.room.width / 2 - 0.3,
    halfZ = setup.room.depth / 2 - 0.28;
  const xStep = { x: clamp(from.x + delta.x, -halfX, halfX), z: from.z };
  const x = walkBlocked(setup, xStep) ? from.x : xStep.x;
  const zStep = { x, z: clamp(from.z + delta.z, -halfZ, halfZ) };
  return { x, z: walkBlocked(setup, zStep) ? from.z : zStep.z };
}
