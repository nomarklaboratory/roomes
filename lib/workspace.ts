import {
  catalog,
  durations,
  finishes,
  presets,
  type Finish,
  type PresetId,
  type Weeks,
} from "./catalog.ts";
import {
  clampPosition,
  defaultLayout,
  isPoint,
  type Layout,
  type Point,
} from "./placement.ts";

export type Slot =
  | "rear-left"
  | "rear-center"
  | "rear-right"
  | "front-left"
  | "front-center"
  | "front-right";
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
};
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
  if (!p || p.category !== "accessory") return false;
  return p.kind === "monitor"
    ? monitorFits(setup, productId)
    : !setup.items.some((i) => catalog[i.productId]?.kind === p.kind);
}
export function normalize(setup: Setup): Setup {
  const items: Item[] = [];
  const ids = new Set<string>();
  for (const item of setup.items) {
    if (ids.has(item.id) || !canAdd({ ...setup, items }, item.productId))
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
  for (const item of items.filter(
    (i) => catalog[i.productId].kind !== "monitor",
  )) {
    if (!front.includes(item.slot) || occupied.has(item.slot))
      item.slot = front.find((s) => !occupied.has(s))!;
    occupied.add(item.slot);
  }
  const next = { ...setup, items };
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
export type Action =
  | { type: "preset"; id: PresetId }
  | { type: "desk" | "chair"; id: string }
  | { type: "finish"; value: Finish }
  | { type: "weeks"; value: Weeks }
  | { type: "add"; productId: string; id: string }
  | { type: "remove"; id: string }
  | { type: "move"; id: string; slot: Slot }
  | { type: "place"; id: string; position: Point }
  | { type: "reset-position"; id: string }
  | { type: "reset" }
  | { type: "undo" }
  | { type: "hydrate"; setup: Setup };
export type History = { present: Setup; past: Setup[]; notice: string };
export const initialHistory = (): History => ({
  present: presetSetup("developer"),
  past: [],
  notice: "",
});
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
    case "preset":
      next = { ...presetSetup(action.id), weeks: s.weeks };
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
      next = { ...s, finish: action.value };
      notice = "Finish updated.";
      break;
    case "weeks":
      next = { ...s, weeks: action.value };
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
    case "move": {
      const item = s.items.find((i) => i.id === action.id);
      if (item && allowedSlots(s, item).includes(action.slot)) {
        next = {
          ...s,
          items: s.items.map((i) =>
            i.id === item.id
              ? { ...i, slot: action.slot, position: undefined }
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
          layout: { ...s.layout, [action.id]: defaultLayout()[action.id] },
        };
      } else {
        next = {
          ...s,
          items: s.items.map((i) =>
            i.id === action.id ? { ...i, position: undefined } : i,
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
export function decodeSaved(raw: string | null): Setup | null {
  try {
    const value = JSON.parse(raw ?? "null");
    const s = value?.setup;
    if (
      value?.version !== 1 ||
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
          ? { position: { x: i.position.x, z: i.position.z } }
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
