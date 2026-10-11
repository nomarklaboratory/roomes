import type { Finish, PresetId, Weeks } from "./catalog.ts";
import type { Layout, Point, RoomDimensions } from "./placement.ts";

export type Slot =
  | "rear-left"
  | "rear-center"
  | "rear-right"
  | "front-left"
  | "front-center"
  | "front-right"
  | "wall-center"
  | "mat-center"
  | "pad-right"
  | "input-center"
  | "input-right"
  | "control-left";
export type Item = {
  id: string;
  productId: string;
  slot: Slot;
  position?: Point;
};
export type Setup = {
  presetId: PresetId;
  deskId: string;
  chairId: string;
  finish: Finish;
  weeks: Weeks;
  items: Item[];
  layout: Layout;
  room: RoomDimensions;
};
export type Action =
  | { type: "apply-brief"; setup: Setup }
  | { type: "preset"; id: PresetId }
  | { type: "desk" | "chair"; id: string }
  | { type: "finish"; value: Finish }
  | { type: "weeks"; value: Weeks }
  | { type: "room"; dimensions: RoomDimensions }
  | { type: "add"; productId: string; id: string }
  | { type: "duplicate"; id: string; newId: string }
  | { type: "remove"; id: string }
  | { type: "move"; id: string; slot: Slot }
  | { type: "place"; id: string; position: Point }
  | { type: "reset-position"; id: string }
  | { type: "reset" }
  | { type: "undo" }
  | { type: "hydrate"; setup: Setup };
export type History = { present: Setup; past: Setup[]; notice: string };
