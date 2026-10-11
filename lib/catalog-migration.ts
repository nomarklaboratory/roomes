import { catalog, finishes } from "./catalog.ts";
import type { Finish } from "../types/catalog.ts";

const legacyProducts: Record<string, string> = {
  "electric-desk": "jarvis-bamboo",
  "wooden-desk": "jarvis-laminate",
  "ergonomic-chair": "herman-miller-aeron",
  "task-chair": "herman-miller-sayl",
  "monitor-27": "dell-u2725qe",
  "monitor-34": "dell-u3425we",
  "desk-lamp": "benq-wit",
  plant: "ikea-fejka",
  "laptop-stand": "twelve-south-curve",
};
const legacyFinishes: Record<string, Finish> = {
  oat: "bamboo",
  chalk: "white",
  walnut: "white",
};

export function migrateProductId(value: unknown) {
  if (typeof value !== "string") return undefined;
  const id = Object.hasOwn(legacyProducts, value)
    ? legacyProducts[value]
    : value;
  return Object.hasOwn(catalog, id) ? id : undefined;
}
export function migrateFinish(value: unknown): Finish | undefined {
  if (typeof value !== "string") return undefined;
  if (Object.hasOwn(legacyFinishes, value)) return legacyFinishes[value];
  return finishes.find((f) => f.id === value)?.id;
}
