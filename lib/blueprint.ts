import { catalog } from "./catalog.ts";
import { accessorySurfaceHeight, positionOf, productFor } from "./placement.ts";
import type { Setup } from "../types/workspace.ts";
import type { Point } from "../types/placement.ts";
import type {
  BlueprintDocument,
  BlueprintItem,
  BlueprintViewId,
  PlacementMeasurements,
} from "../types/blueprint.ts";

export const cm = (metres: number) => Math.round(metres * 1000) / 10;
export const measurementText = (value: number) =>
  `${Math.round(value * 10) / 10} cm`;
export function placementView(setup: Setup, id: string): BlueprintViewId {
  if (id === "desk" || id === "chair") return "room";
  return productFor(setup, id)?.mount === "back-wall" ? "wall" : "desk";
}
export function placementMeasurements(
  setup: Setup,
  id: string,
  point = positionOf(setup, id),
): PlacementMeasurements {
  const product = productFor(setup, id);
  if (!product) throw new Error("Product no longer exists.");
  const view = placementView(setup, id);
  const surface = view === "desk" ? catalog[setup.deskId] : setup.room;
  return {
    left: cm(point.x + surface.width / 2 - product.width / 2),
    offset:
      view === "wall"
        ? cm(point.y ?? 0)
        : cm(point.z + surface.depth / 2 - product.depth / 2),
  };
}
export function pointFromMeasurements(
  setup: Setup,
  id: string,
  values: PlacementMeasurements,
): Point {
  const product = productFor(setup, id);
  if (!product) throw new Error("Product no longer exists.");
  const view = placementView(setup, id);
  const surface = view === "desk" ? catalog[setup.deskId] : setup.room;
  const point = {
    x: values.left / 100 - surface.width / 2 + product.width / 2,
    z: positionOf(setup, id).z,
  };
  if (view === "wall") return { ...point, y: values.offset / 100 };
  return {
    ...point,
    z: values.offset / 100 - surface.depth / 2 + product.depth / 2,
  };
}
export const placementLabels = {
  room: {
    left: "From left wall (cm)",
    offset: "From back wall (cm)",
    help: "Measure to the nearest edge of the product, not its centre.",
  },
  desk: {
    left: "From left desk edge (cm)",
    offset: "From back desk edge (cm)",
    help: "Measure from the tabletop edge to the nearest edge of the accessory.",
  },
  wall: {
    left: "From left wall edge (cm)",
    offset: "Bottom height from floor (cm)",
    help: "Measure to the left edge and bottom of the product.",
  },
} as const;

export function createBlueprint(
  setup: Setup,
  createdAt = "",
): BlueprintDocument {
  const ids = ["desk", "chair", ...setup.items.map((item) => item.id)];
  const items: BlueprintItem[] = ids.map((id, index) => {
    const product = productFor(setup, id)!;
    const view = placementView(setup, id);
    return {
      id,
      number: index + 1,
      name: product.name,
      brand: product.brand,
      view,
      width: cm(product.width),
      depth: cm(product.depth),
      height: cm(product.height),
      ...placementMeasurements(setup, id),
      surfaceHeight:
        view === "desk" ? cm(accessorySurfaceHeight(setup, id)) : 0,
      estimated: product.scale.status === "estimated",
    };
  });
  const room = {
    width: cm(setup.room.width),
    depth: cm(setup.room.depth),
    height: cm(setup.room.height),
  };
  const desk = catalog[setup.deskId];
  const definitions = [
    {
      id: "room" as const,
      title: "Room plan",
      width: room.width,
      height: room.depth,
    },
    {
      id: "desk" as const,
      title: "Desk plan",
      width: cm(desk.width),
      height: cm(desk.depth),
    },
    {
      id: "wall" as const,
      title: "Back wall",
      width: room.width,
      height: room.height,
    },
  ];
  const views = definitions
    .filter(
      (view) =>
        view.id !== "wall" || items.some((item) => item.view === "wall"),
    )
    .map((view) => ({
      ...view,
      footprints: items
        .filter((item) => item.view === view.id)
        .map((item) => ({
          item,
          x: item.left,
          y:
            view.id === "wall"
              ? view.height - item.offset - item.height
              : item.offset,
          width: item.width,
          height: view.id === "wall" ? item.height : item.depth,
          ...(view.id === "room" && {
            facing: item.id === "chair" ? ("up" as const) : ("down" as const),
          }),
        })),
    }));
  return { createdAt, room, items, views };
}
