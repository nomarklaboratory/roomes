export type Point = { x: number; z: number; y?: number };
export type Layout = { desk: Point; chair: Point };
export type RoomDimensions = { width: number; depth: number; height: number };
export type PlacementBounds = {
  x: readonly [number, number];
  z: readonly [number, number];
  y?: readonly [number, number];
};
