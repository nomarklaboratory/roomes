import type { AccessoryKind, Product } from "../types/catalog.ts";
import type { Slot } from "../types/workspace.ts";

const slots: Partial<Record<AccessoryKind, Slot>> = {
  "desk-mat": "mat-center",
  "mouse-pad": "pad-right",
  keyboard: "input-center",
  mouse: "input-right",
  controller: "control-left",
};

export const accessorySlot = (product: Product) =>
  product.kind && slots[product.kind];
export const isMat = (product: Product) =>
  product.kind === "desk-mat" || product.kind === "mouse-pad";

export function accessoryHome(product: Product, desk: Product) {
  const z = desk.depth / 2 - 0.18;
  switch (product.kind) {
    case "desk-mat":
      return { x: 0, z };
    case "mouse-pad":
    case "mouse":
      return { x: 0.24, z };
    case "keyboard":
      return { x: -0.12, z };
    case "controller":
      return { x: -desk.width / 2 + product.width / 2 + 0.06, z: 0 };
    default:
      return undefined;
  }
}
