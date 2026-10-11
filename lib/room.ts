import type { RoomDimensions } from "../types/placement.ts";

export const defaultRoom = (): RoomDimensions => ({
  width: 3.6,
  depth: 3.1,
  height: 2.65,
});
export const roomLimits = {
  width: [2.4, 10],
  depth: [2.4, 10],
  height: [2.2, 5],
} as const;
export function validRoom(value: unknown): value is RoomDimensions {
  if (!value || typeof value !== "object") return false;
  return Object.entries(roomLimits).every(([key, [min, max]]) => {
    const n = (value as Record<string, unknown>)[key];
    return typeof n === "number" && Number.isFinite(n) && n >= min && n <= max;
  });
}
export function normalizeRoom(value: unknown): RoomDimensions {
  if (!validRoom(value)) return defaultRoom();
  return Object.fromEntries(
    Object.keys(roomLimits).map((key) => [
      key,
      Math.round(value[key as keyof RoomDimensions] * 100) / 100,
    ]),
  ) as RoomDimensions;
}
export const roomLabel = (room: RoomDimensions) =>
  `${room.width} × ${room.depth} × ${room.height} m`;
export const wallZ = (room: RoomDimensions) => -room.depth / 2 + 0.085;
export const stoolPosition = (room: RoomDimensions) => ({
  x: room.width / 2 - 0.49,
  z: -room.depth / 2 + 0.47,
});
export const roomCameraScale = (room: RoomDimensions) =>
  Math.max(room.width / 3.6, room.depth / 3.1, room.height / 2.65);
