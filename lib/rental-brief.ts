import { catalog, presets, products, money } from "./catalog.ts";
import { defaultRoom, normalizeRoom } from "./room.ts";
import { normalize, presetSetup, quote } from "./workspace.ts";
import type { PresetId } from "../types/catalog.ts";
import type { Setup } from "../types/workspace.ts";
import type {
  RentalBrief,
  SetupRecommendation,
  WorkStyle,
} from "../types/rental-brief.ts";

export const baliAreas = [
  "Canggu",
  "Ubud",
  "Seminyak",
  "Uluwatu",
  "Sanur",
  "Denpasar",
  "Other Bali area",
] as const;
export const workStyles = [
  {
    value: "everyday",
    label: "Everyday work",
    description: "Calls, writing & getting things done",
  },
  {
    value: "coding",
    label: "Coding & data",
    description: "Space to focus on the details",
  },
  {
    value: "creative",
    label: "Design & content",
    description: "A little more room to create",
  },
] as const;
export const screenChoices = [
  { value: "recommend", label: "Help me choose" },
  { value: "none", label: "My laptop screen is enough" },
  { value: "standard", label: "One 27-inch monitor" },
  { value: "wide", label: "One 34-inch ultrawide" },
  { value: "dual", label: "Two 27-inch monitors" },
] as const;
export const connectionLabels = {
  "usb-c": "USB-C",
  hdmi: "HDMI",
  unsure: "Not sure yet",
} as const;
export const workPreset: Record<WorkStyle, PresetId> = {
  everyday: "essentials",
  coding: "developer",
  creative: "creative",
};
export function defaultRentalBrief(): RentalBrief {
  return {
    area: "",
    date: "",
    weeks: 4,
    workStyle: "everyday",
    screens: "recommend",
    weeklyBudgetCents: null,
    laptopConnection: "unsure",
    room: null,
  };
}

// Optional extras may be omitted to meet a budget. Requested monitors never are.
function extraSubsets(ids: readonly string[]): string[][] {
  return ids.reduce<string[][]>(
    (sets, id) => [...sets, ...sets.map((set) => [...set, id])],
    [[]],
  );
}
export function recommendSetup(
  brief: RentalBrief,
  currentRoom = defaultRoom(),
): SetupRecommendation {
  const presetId = workPreset[brief.workStyle];
  const preset = presets.find((entry) => entry.id === presetId)!;
  const base = presetSetup(presetId);
  const monitors =
    brief.screens === "recommend"
      ? base.items
          .filter((item) => catalog[item.productId].kind === "monitor")
          .map((item) => item.productId)
      : brief.screens === "none"
        ? []
        : brief.screens === "wide"
          ? ["dell-u3425we"]
          : brief.screens === "dual"
            ? ["dell-u2725qe", "dell-u2725qe"]
            : ["dell-u2725qe"];
  const extras = base.items
    .filter((item) => catalog[item.productId].kind !== "monitor")
    .map((item) => item.productId);
  const candidates: {
    setup: Setup;
    cost: number;
    changes: number;
    key: string;
  }[] = [];
  for (const desk of products.filter(
    (product) => product.category === "desk",
  )) {
    if (
      monitors.reduce((sum, id) => sum + catalog[id].width, 0) +
        Math.max(0, monitors.length - 1) * 0.04 >
      desk.width
    )
      continue;
    for (const chair of products.filter(
      (product) => product.category === "chair",
    )) {
      for (const subset of extraSubsets(extras)) {
        const setup = normalize({
          ...base,
          deskId: desk.id,
          chairId: chair.id,
          weeks: brief.weeks,
          room: normalizeRoom(brief.room ?? currentRoom),
          items: [...monitors, ...subset].map((productId, index) => ({
            id: `brief-${index}`,
            productId,
            slot:
              catalog[productId].kind === "monitor"
                ? "rear-center"
                : "front-left",
          })),
        });
        // Normalization must not silently drop a requested item.
        if (setup.items.length !== monitors.length + subset.length) continue;
        candidates.push({
          setup,
          cost: quote(setup).weeklyCents,
          changes:
            Number(desk.id !== preset.desk) +
            Number(chair.id !== preset.chair) +
            extras.length -
            subset.length,
          key: [desk.id, chair.id, ...subset].join("/"),
        });
      }
    }
  }
  if (!candidates.length)
    throw new Error("The catalog cannot provide this screen arrangement.");
  const affordable =
    brief.weeklyBudgetCents === null
      ? candidates
      : candidates.filter(
          (candidate) => candidate.cost <= brief.weeklyBudgetCents!,
        );
  const pool = affordable.length ? affordable : candidates;
  pool.sort(
    (a, b) =>
      (affordable.length ? a.changes - b.changes : 0) ||
      a.cost - b.cost ||
      (a.key < b.key ? -1 : a.key > b.key ? 1 : 0),
  );
  const chosen = pool[0];
  const rental = quote(chosen.setup);
  const reasons = [
    `${preset.name} is your starting point for ${workStyles.find((style) => style.value === brief.workStyle)!.label.toLowerCase()}.`,
    monitors.length === 0
      ? "A desk and chair, with room for your laptop."
      : monitors.length === 2
        ? "A wider desk fits both 27-inch monitors."
        : brief.screens === "wide" || monitors[0] === "dell-u3425we"
          ? "An ultrawide gives you more space on one screen."
          : "One 27-inch monitor gives you a second screen.",
  ];
  const budgetShortfallCents =
    brief.weeklyBudgetCents === null
      ? 0
      : Math.max(0, rental.weeklyCents - brief.weeklyBudgetCents);
  if (brief.weeklyBudgetCents !== null)
    reasons.push(
      budgetShortfallCents
        ? `The lowest equipment estimate for these screens is ${money(budgetShortfallCents)} / week over your budget. Try fewer screens or a higher budget.`
        : `This equipment estimate fits your ${money(brief.weeklyBudgetCents)} / week budget.`,
    );
  if (chosen.changes && affordable.length)
    reasons.push(
      "Furniture or optional extras were adjusted to keep this suggestion a good fit.",
    );
  return {
    setup: chosen.setup,
    weeklyCents: rental.weeklyCents,
    totalCents: rental.totalCents,
    reasons,
    budgetShortfallCents,
  };
}
