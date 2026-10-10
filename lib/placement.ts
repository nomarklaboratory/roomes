import { catalog } from "./catalog.ts";
import type { Item, Setup } from "./workspace.ts";

// All coordinates are metres. Accessories use the desk's local X/Z plane;
// furniture uses the room floor. Moving a desk therefore carries its contents.
export type Point = { x: number; z: number };
export type Layout = { desk: Point; chair: Point };
export const defaultLayout = (): Layout => ({
  desk: { x: 0, z: -0.43 },
  chair: { x: 0.16, z: 0.35 },
});
export function isPoint(value: unknown): value is Point {
  if (!value || typeof value !== "object") return false;
  const p = value as Point;
  return Number.isFinite(p.x) && Number.isFinite(p.z);
}
const clamp = (n: number, min: number, max: number) =>
  Math.round(Math.max(min, Math.min(max, n)) * 1000) / 1000;

export function slotPosition(setup: Setup, item: Item): Point {
  const desk = catalog[setup.deskId];
  const product = catalog[item.productId];
  const rear = item.slot.startsWith("rear");
  const side = item.slot.endsWith("left")
    ? -1
    : item.slot.endsWith("right")
      ? 1
      : 0;
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
export function clampPosition(setup: Setup, id: string, point: Point): Point {
  const item = setup.items.find((i) => i.id === id);
  const product =
    catalog[
      id === "desk"
        ? setup.deskId
        : id === "chair"
          ? setup.chairId
          : (item?.productId ?? "")
    ];
  if (!product || !isPoint(point)) return positionOf(setup, id);
  const desk = catalog[setup.deskId];
  const halfX = id === "desk" || id === "chair" ? 1.68 : desk.width / 2;
  const halfZ = id === "desk" || id === "chair" ? 1.43 : desk.depth / 2;
  const insetX = product.width / 2 + 0.015;
  const insetZ = product.depth / 2 + 0.015;
  return {
    x: clamp(point.x, -halfX + insetX, halfX - insetX),
    z: clamp(point.z, -halfZ + insetZ, halfZ - insetZ),
  };
}
export function walkBlocked(setup: Setup, point: Point) {
  if (Math.abs(point.x) > 1.5 || Math.abs(point.z) > 1.27) return true;
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
    { point: { x: 1.31, z: -1.08 }, width: 0.4, depth: 0.4 },
  ].some(
    ({ point: p, width, depth }) =>
      Math.abs(point.x - p.x) < width / 2 + 0.14 &&
      Math.abs(point.z - p.z) < depth / 2 + 0.14,
  );
}
export function walkStart(setup: Setup): Point {
  const candidates = [
    { x: 0, z: 1.26 },
    { x: -1.49, z: 1.26 },
    { x: 1.49, z: 1.26 },
    { x: -1.49, z: 0 },
    { x: 1.49, z: 0 },
    { x: 0, z: -1.26 },
  ];
  return candidates.find((p) => !walkBlocked(setup, p))!;
}
export function walkStep(setup: Setup, from: Point, delta: Point): Point {
  const xStep = { x: clamp(from.x + delta.x, -1.5, 1.5), z: from.z };
  const x = walkBlocked(setup, xStep) ? from.x : xStep.x;
  const zStep = { x, z: clamp(from.z + delta.z, -1.27, 1.27) };
  return { x, z: walkBlocked(setup, zStep) ? from.z : zStep.z };
}
