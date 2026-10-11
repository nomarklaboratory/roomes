import {
  catalog,
  durations,
  finishes,
  normalizeFinish,
  presets,
  type PresetId,
} from "./catalog.ts";
import { migrateFinish, migrateProductId } from "./catalog-migration.ts";
import {
  clampPosition,
  defaultLayout,
  isPoint,
  positionOf,
  slotPosition,
} from "./placement.ts";
import { defaultRoom, normalizeRoom, validRoom } from "./room.ts";
import { accessorySlot } from "./accessory-placement.ts";
import { duplicatePlacement, MAX_ACCESSORIES } from "./product-duplication.ts";

import type { Slot, Item, Setup, Action, History } from "../types/workspace.ts";
export type { Slot, Item, Setup, Action, History } from "../types/workspace.ts";
const front: Slot[] = ["front-left", "front-right", "front-center"];
const rear: Slot[] = ["rear-center", "rear-left", "rear-right"];
export function presetSetup(id: PresetId): Setup {
  const preset = presets.find((p) => p.id === id) ?? presets[1];
  return normalize({
    presetId: preset.id,
    deskId: preset.desk,
    chairId: preset.chair,
    finish: preset.finish,
    weeks: 4,
    layout: defaultLayout(),
    room: defaultRoom(),
    items: preset.extras.map((productId, i) => ({
      id: `preset-${i}`,
      productId,
      slot:
        catalog[productId].kind === "monitor"
          ? "rear-center"
          : front[i % front.length],
    })),
  });
}
export function monitorFits(setup: Setup, productId: string) {
  const monitors = setup.items.filter(
    (i) => catalog[i.productId]?.kind === "monitor",
  );
  return (
    monitors.length < 2 &&
    monitors.reduce(
      (sum, i) => sum + catalog[i.productId].width,
      catalog[productId].width,
    ) +
      0.04 * monitors.length <=
      catalog[setup.deskId].width
  );
}
export function canAdd(setup: Setup, productId: string) {
  const p = catalog[productId];
  if (!p || p.category !== "accessory" || setup.items.length >= MAX_ACCESSORIES)
    return false;
  return p.kind === "monitor"
    ? monitorFits(setup, productId)
    : !setup.items.some((i) => catalog[i.productId]?.kind === p.kind);
}
export function normalize(setup: Setup): Setup {
  const items: Item[] = [];
  const ids = new Set<string>();
  for (const item of setup.items) {
    const current = { ...setup, items };
    const positionedCopy =
      isPoint(item.position) &&
      catalog[item.productId]?.category === "accessory" &&
      catalog[item.productId].kind !== "monitor" &&
      items.some((other) => other.productId === item.productId);
    if (
      items.length >= MAX_ACCESSORIES ||
      ids.has(item.id) ||
      (!canAdd(current, item.productId) && !positionedCopy)
    )
      continue;
    ids.add(item.id);
    items.push({ ...item });
  }
  const monitors = items.filter((i) => catalog[i.productId].kind === "monitor");
  if (monitors.length === 2) {
    monitors[0].slot = "rear-left";
    monitors[1].slot = "rear-right";
  } else if (monitors.length === 1 && !rear.includes(monitors[0].slot))
    monitors[0].slot = "rear-center";
  const occupied = new Set<Slot>();
  for (const item of items) {
    const slot = accessorySlot(catalog[item.productId]);
    if (slot) item.slot = slot;
  }
  for (const item of items.filter(
    (i) =>
      catalog[i.productId].kind !== "monitor" &&
      !catalog[i.productId].mount &&
      !accessorySlot(catalog[i.productId]),
  )) {
    if (item.position) {
      if (!front.includes(item.slot)) item.slot = "front-center";
      occupied.add(item.slot);
      continue;
    }
    if (!front.includes(item.slot) || occupied.has(item.slot))
      item.slot = front.find((s) => !occupied.has(s)) ?? "front-center";
    occupied.add(item.slot);
  }
  for (const item of items.filter((i) => catalog[i.productId].mount))
    item.slot = "wall-center";
  const next = {
    ...setup,
    finish: normalizeFinish(setup.deskId, setup.finish),
    items,
    room: normalizeRoom(setup.room),
  };
  return {
    ...next,
    layout: {
      desk: clampPosition(next, "desk", setup.layout.desk),
      chair: clampPosition(next, "chair", setup.layout.chair),
    },
    items: items.map((item) =>
      item.position
        ? {
            ...item,
            position: clampPosition(next, item.id, item.position),
          }
        : item,
    ),
  };
}
export function allowedSlots(setup: Setup, item: Item): Slot[] {
  if (catalog[item.productId].mount || accessorySlot(catalog[item.productId]))
    return [];
  const monitor = catalog[item.productId].kind === "monitor";
  if (
    monitor &&
    setup.items.filter((i) => catalog[i.productId].kind === "monitor")
      .length === 2
  )
    return [item.slot];
  return (monitor ? rear : front).filter(
    (slot) => !setup.items.some((i) => i.id !== item.id && i.slot === slot),
  );
}
export const initialHistory = (): History => ({
  present: presetSetup("developer"),
  past: [],
  notice: "",
});
function hasAccessoryCopies(setup: Setup, item: Item) {
  return (
    catalog[item.productId].kind !== "monitor" &&
    setup.items.some(
      (other) => other.id !== item.id && other.productId === item.productId,
    )
  );
}
function resetAccessoryPosition(setup: Setup, item: Item) {
  if (!hasAccessoryCopies(setup, item)) return undefined;
  const others = {
    ...setup,
    items: setup.items.filter((other) => other.id !== item.id),
  };
  const sibling = others.items.find(
    (other) => other.productId === item.productId,
  )!;
  return (
    duplicatePlacement(others, sibling.id, slotPosition(setup, item)) ??
    positionOf(setup, item.id)
  );
}
export function reducer(state: History, action: Action): History {
  const s = state.present;
  if (action.type === "hydrate")
    return {
      present: action.setup,
      past: [],
      notice: "Saved workspace restored.",
    };
  if (action.type === "undo")
    return state.past.length
      ? {
          present: state.past.at(-1)!,
          past: state.past.slice(0, -1),
          notice: "Last change undone.",
        }
      : state;
  let next = s;
  let notice = "";
  switch (action.type) {
    case "apply-brief":
      next = normalize(action.setup);
      notice =
        "Your suggested setup is ready. Undo to restore the previous workspace.";
      break;
    case "preset":
      next = normalize({
        ...presetSetup(action.id),
        weeks: s.weeks,
        room: s.room,
      });
      notice = "Room preset applied.";
      break;
    case "reset":
      next = presetSetup("developer");
      notice = "Back to the Deep focus setup.";
      break;
    case "desk":
      if (catalog[action.id]?.category === "desk") {
        next = normalize({ ...s, deskId: action.id });
        notice =
          next.items.length < s.items.length
            ? "An extra monitor was removed to fit this desk. Undo to bring it back."
            : "Desk updated.";
      }
      break;
    case "chair":
      if (catalog[action.id]?.category === "chair") {
        next = normalize({ ...s, chairId: action.id });
        notice = "Chair updated.";
      }
      break;
    case "finish":
      if (catalog[s.deskId].finishes?.includes(action.value))
        next = { ...s, finish: action.value };
      notice = "Finish updated.";
      break;
    case "weeks":
      next = { ...s, weeks: action.value };
      break;
    case "room":
      if (validRoom(action.dimensions)) {
        next = normalize({ ...s, room: action.dimensions });
        notice = "Room dimensions updated. Furniture stays at its real size.";
      }
      break;
    case "add":
      if (canAdd(s, action.productId)) {
        next = normalize({
          ...s,
          items: [
            ...s.items,
            {
              id: action.id,
              productId: action.productId,
              slot: "front-center",
            },
          ],
        });
        notice = `${catalog[action.productId].name} added.`;
      }
      break;
    case "remove":
      next = normalize({
        ...s,
        items: s.items.filter((i) => i.id !== action.id),
      });
      notice = "Item removed.";
      break;
    case "duplicate": {
      const source = s.items.find((item) => item.id === action.id);
      const position = duplicatePlacement(s, action.id);
      if (
        !source ||
        !position ||
        !action.newId ||
        ["desk", "chair"].includes(action.newId) ||
        s.items.some((item) => item.id === action.newId)
      )
        break;
      const monitor = catalog[source.productId].kind === "monitor";
      next = normalize({
        ...s,
        items: [
          ...s.items.map((item) =>
            monitor && item.productId === source.productId
              ? { ...item, position: undefined }
              : item,
          ),
          {
            ...source,
            id: action.newId,
            position: monitor ? undefined : position,
          },
        ],
      });
      notice = `Another ${catalog[source.productId].name} added. Undo to remove the copy.`;
      break;
    }
    case "move": {
      const item = s.items.find((i) => i.id === action.id);
      if (item && allowedSlots(s, item).includes(action.slot)) {
        next = {
          ...s,
          items: s.items.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  slot: action.slot,
                  position: hasAccessoryCopies(s, i)
                    ? clampPosition(
                        s,
                        i.id,
                        slotPosition(s, { ...i, slot: action.slot }),
                      )
                    : undefined,
                }
              : i,
          ),
        };
        notice = "Position updated.";
      }
      break;
    }
    case "place": {
      if (!isPoint(action.position)) break;
      if (action.id === "desk" || action.id === "chair") {
        next = {
          ...s,
          layout: {
            ...s.layout,
            [action.id]: clampPosition(s, action.id, action.position),
          },
        };
      } else if (s.items.some((i) => i.id === action.id)) {
        next = {
          ...s,
          items: s.items.map((i) =>
            i.id === action.id
              ? { ...i, position: clampPosition(s, i.id, action.position) }
              : i,
          ),
        };
      }
      notice = "Position updated. Undo to return to the previous spot.";
      break;
    }
    case "reset-position": {
      if (action.id === "desk" || action.id === "chair") {
        next = {
          ...s,
          layout: {
            ...s.layout,
            [action.id]: clampPosition(
              s,
              action.id,
              defaultLayout()[action.id],
            ),
          },
        };
      } else {
        next = {
          ...s,
          items: s.items.map((i) =>
            i.id === action.id
              ? {
                  ...i,
                  position: resetAccessoryPosition(s, i),
                }
              : i,
          ),
        };
      }
      notice = "Item returned to its starting position.";
      break;
    }
  }
  return JSON.stringify(next) === JSON.stringify(s)
    ? state
    : { present: next, past: [...state.past, s].slice(-30), notice };
}
export function quote(setup: Setup) {
  const counts = new Map<string, number>();
  for (const id of [
    setup.deskId,
    setup.chairId,
    ...setup.items.map((i) => i.productId),
  ])
    counts.set(id, (counts.get(id) ?? 0) + 1);
  const lines = [...counts].map(([id, quantity]) => ({
    product: catalog[id],
    quantity,
    weeklyCents: catalog[id].weeklyCents * quantity,
  }));
  const weeklyCents = lines.reduce((sum, l) => sum + l.weeklyCents, 0);
  return {
    lines,
    weeklyCents,
    totalCents: weeklyCents * setup.weeks,
    count: 2 + setup.items.length,
  };
}
export const STORAGE_KEY = "roomes.workspace.v1";
export const STORAGE_VERSION = 3;
export function decodeSaved(raw: string | null): Setup | null {
  try {
    const value = JSON.parse(raw ?? "null");
    const saved = value?.setup;
    if (
      !saved ||
      ![1, 2, STORAGE_VERSION].includes(value.version) ||
      !Array.isArray(saved.items)
    )
      return null;
    const s = {
      ...saved,
      deskId: migrateProductId(saved.deskId),
      chairId: migrateProductId(saved.chairId),
      finish: migrateFinish(saved.finish),
      items: saved.items.map((item: Item) => ({
        ...item,
        productId: migrateProductId(item?.productId),
      })),
    };
    if (
      !s ||
      catalog[s.deskId]?.category !== "desk" ||
      catalog[s.chairId]?.category !== "chair" ||
      !presets.some((p) => p.id === s.presetId) ||
      !finishes.some((f) => f.id === s.finish) ||
      !durations.includes(s.weeks) ||
      !Array.isArray(s.items) ||
      s.items.length > 20
    )
      return null;
    if (
      s.items.some(
        (i: Item) =>
          typeof i.id !== "string" ||
          !i.id ||
          !catalog[i.productId] ||
          typeof i.slot !== "string",
      )
    )
      return null;
    return normalize({
      presetId: s.presetId,
      deskId: s.deskId,
      chairId: s.chairId,
      finish: s.finish,
      weeks: s.weeks,
      room: normalizeRoom(s.room),
      layout: {
        desk: isPoint(s.layout?.desk)
          ? { x: s.layout.desk.x, z: s.layout.desk.z }
          : defaultLayout().desk,
        chair: isPoint(s.layout?.chair)
          ? { x: s.layout.chair.x, z: s.layout.chair.z }
          : defaultLayout().chair,
      },
      items: s.items.map((i: Item) => ({
        id: i.id,
        productId: i.productId,
        slot: i.slot,
        ...(isPoint(i.position)
          ? {
              position: {
                x: i.position.x,
                z: i.position.z,
                ...(i.position.y === undefined ? {} : { y: i.position.y }),
              },
            }
          : {}),
      })),
    });
  } catch {
    return null;
  }
}
export function baliToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"]
    .map((type) => parts.find((p) => p.type === type)!.value)
    .join("-");
}
export function validDeliveryDate(value: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    value > baliToday(now)
  );
}
