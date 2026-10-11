import { catalog } from "./catalog.ts";
import { isMat } from "./accessory-placement.ts";
import {
  clampPosition,
  isPoint,
  positionOf,
  slotPosition,
} from "./placement.ts";
import type { Point } from "../types/placement.ts";
import type { Item, Setup } from "../types/workspace.ts";

const GAP = 0.025;
export const MAX_ACCESSORIES = 20;

function blockers(setup: Setup, productId: string) {
  const product = catalog[productId];
  return setup.items.filter((item) => {
    const other = catalog[item.productId];
    if (other.mount !== product.mount) return false;
    // A mat can support another object. Copies of the same mat need space.
    return product.kind === other.kind || (!isMat(product) && !isMat(other));
  });
}

export function additionalInstanceFits(setup: Setup, item: Item) {
  const product = catalog[item.productId];
  const source = setup.items.find(
    (other) => other.productId === item.productId,
  );
  if (
    !source ||
    !product ||
    product.category !== "accessory" ||
    product.kind === "monitor" ||
    setup.items.length >= MAX_ACCESSORIES ||
    !isPoint(item.position)
  )
    return false;
  const point = item.position;
  const clamped = clampPosition(setup, source.id, point);
  const axis = product.mount ? "y" : "z";
  if (
    Math.abs(point.x - clamped.x) > 0.001 ||
    Math.abs((point[axis] ?? 0) - (clamped[axis] ?? 0)) > 0.001
  )
    return false;
  const extent = product.mount ? product.height : product.depth;
  return blockers(setup, item.productId).every((other) => {
    const dimensions = catalog[other.productId];
    const center = positionOf(setup, other.id);
    const otherExtent = product.mount ? dimensions.height : dimensions.depth;
    return (
      Math.abs(point.x - center.x) >=
        (product.width + dimensions.width) / 2 + GAP - 0.001 ||
      Math.abs((point[axis] ?? 0) - (center[axis] ?? 0)) >=
        (extent + otherExtent) / 2 + GAP - 0.001
    );
  });
}

// Copies use new surface coordinates, not the original item's occupied slot.
// Search rectangle edges nearest the source, rather than sampling the room.
export function duplicatePlacement(
  setup: Setup,
  id: string,
  origin = positionOf(setup, id),
): Point | null {
  const source = setup.items.find((item) => item.id === id);
  if (!source || setup.items.length >= MAX_ACCESSORIES) return null;
  const product = catalog[source.productId];
  if (product?.category !== "accessory") return null;
  if (product.kind === "monitor") {
    const monitors = setup.items.filter(
      (item) => catalog[item.productId].kind === "monitor",
    );
    if (
      monitors.length >= 2 ||
      monitors.reduce(
        (width, item) => width + catalog[item.productId].width,
        product.width,
      ) +
        0.04 * monitors.length >
        catalog[setup.deskId].width
    )
      return null;
    return slotPosition(setup, { ...source, slot: "rear-right" });
  }
  const minimum = clampPosition(setup, id, { x: -1000, z: -1000, y: -1000 });
  const maximum = clampPosition(setup, id, { x: 1000, z: 1000, y: 1000 });
  const axis = product.mount ? "y" : "z";
  const extent = product.mount ? product.height : product.depth;
  const xs = new Set([origin.x, minimum.x, maximum.x]);
  const ys = new Set([
    origin[axis] ?? 0,
    minimum[axis] ?? 0,
    maximum[axis] ?? 0,
  ]);
  for (const other of blockers(setup, source.productId)) {
    const dimensions = catalog[other.productId];
    const center = positionOf(setup, other.id);
    const otherExtent = product.mount ? dimensions.height : dimensions.depth;
    for (const sign of [-1, 1]) {
      xs.add(center.x + sign * ((product.width + dimensions.width) / 2 + GAP));
      ys.add((center[axis] ?? 0) + sign * ((extent + otherExtent) / 2 + GAP));
    }
  }
  const candidates: Point[] = [];
  for (const x of xs)
    for (const y of ys) {
      const point = clampPosition(setup, id, { ...origin, x, [axis]: y });
      if (additionalInstanceFits(setup, { ...source, position: point }))
        candidates.push(point);
    }
  candidates.sort(
    (a, b) =>
      Math.hypot(a.x - origin.x, (a[axis] ?? 0) - (origin[axis] ?? 0)) -
        Math.hypot(b.x - origin.x, (b[axis] ?? 0) - (origin[axis] ?? 0)) ||
      a.x - b.x ||
      (a[axis] ?? 0) - (b[axis] ?? 0),
  );
  return candidates[0] ?? null;
}
