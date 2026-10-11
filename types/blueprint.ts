export type BlueprintViewId = "room" | "desk" | "wall";
export type BlueprintItem = {
  id: string;
  number: number;
  name: string;
  brand: string;
  view: BlueprintViewId;
  width: number;
  depth: number;
  height: number;
  left: number;
  offset: number;
  surfaceHeight: number;
  estimated: boolean;
};
export type BlueprintFootprint = {
  item: BlueprintItem;
  x: number;
  y: number;
  width: number;
  height: number;
  facing?: "up" | "down";
};
export type BlueprintView = {
  id: BlueprintViewId;
  title: string;
  width: number;
  height: number;
  footprints: BlueprintFootprint[];
};
export type BlueprintDocument = {
  createdAt: string;
  room: { width: number; depth: number; height: number };
  views: BlueprintView[];
  items: BlueprintItem[];
};
export type PlacementMeasurements = { left: number; offset: number };
export type PlacementInput = { left: string; offset: string };
