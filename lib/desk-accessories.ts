import type { Product } from "../types/catalog.ts";

const logitech = "https://www.logitech.com/en-us/shop/p/";
const streamDeckSpecs =
  "https://help.elgato.com/hc/en-us/articles/18208816152333-Elgato-Stream-Deck-MK-2-Technical-Specifications";
const specs = (source: string, model: string, note: string) => ({
  status: "listed" as const,
  source,
  model,
  checkedAt: "2026-10-11",
  note,
});

export const deskAccessories: readonly Omit<
  Product,
  "assetPath" | "assetVersion" | "media"
>[] = [
  {
    id: "logitech-desk-mat",
    name: "Studio Desk Mat",
    brand: "Logitech",
    model: "Studio Series · Mid Grey",
    subtitle: "70 × 30 cm · Mid Grey · Stitched fabric",
    category: "accessory",
    kind: "desk-mat",
    weeklyCents: 200,
    width: 0.7,
    depth: 0.3,
    height: 0.002,
    source: `${logitech}desk-mat-studio-series`,
    scale: specs(
      `${logitech}desk-mat-studio-series`,
      "Studio Desk Mat · Mid Grey",
      "Published 700 × 300 × 2 mm. W × D × H describes the mat laid flat. Fabric and stitched edges are stylized; keyboard and mouse shown in supplier photos are separate products.",
    ),
  },
  {
    id: "logitech-mouse-pad",
    name: "Studio Mouse Pad",
    brand: "Logitech",
    model: "Studio Series · Dark Rose",
    subtitle: "23 × 20 cm · Dark Rose · Rubber base",
    category: "accessory",
    kind: "mouse-pad",
    weeklyCents: 100,
    width: 0.23,
    depth: 0.2,
    height: 0.002,
    source: `${logitech}mouse-pad-studio-series`,
    scale: specs(
      `${logitech}mouse-pad-studio-series`,
      "Studio Mouse Pad · Dark Rose",
      "Published 230 × 200 × 2 mm, laid flat. The cloth surface, stitched edge and anti-slip rubber base are stylized. Mouse is a separate product.",
    ),
  },
  {
    id: "logitech-mx-keys-mini",
    name: "MX Keys Mini",
    brand: "Logitech",
    model: "MX Keys Mini · Graphite · US",
    subtitle: "Compact wireless keyboard · Graphite",
    category: "accessory",
    kind: "keyboard",
    weeklyCents: 300,
    width: 0.29599,
    depth: 0.13195,
    height: 0.02097,
    source: `${logitech}mx-keys-mini`,
    scale: specs(
      `${logitech}mx-keys-mini`,
      "MX Keys Mini · Graphite · US layout",
      "Published 295.99 × 131.95 × 20.97 mm, oriented flat on the desktop. The original preview uses simplified keycaps; legends and backlighting are not simulated.",
    ),
  },
  {
    id: "logitech-mx-master-3s",
    name: "MX Master 3S",
    brand: "Logitech",
    model: "MX Master 3S Bluetooth Edition · Graphite",
    subtitle: "Ergonomic wireless mouse · Graphite",
    category: "accessory",
    kind: "mouse",
    weeklyCents: 300,
    width: 0.0843,
    depth: 0.1249,
    height: 0.051,
    source: `${logitech}mx-master-3s`,
    scale: specs(
      `${logitech}mx-master-3s`,
      "MX Master 3S Bluetooth Edition · Graphite",
      "Published 84.3 × 124.9 × 51 mm desktop envelope. Ergonomic curves, thumb rest and scroll wheels are stylized. Official photos show the Graphite Bluetooth Edition.",
    ),
  },
  {
    id: "elgato-stream-deck-mk2",
    name: "Stream Deck MK.2",
    brand: "Elgato",
    model: "Stream Deck MK.2 · Black",
    subtitle: "15 LCD keys · Desktop shortcut controller",
    category: "accessory",
    kind: "controller",
    weeklyCents: 400,
    width: 0.118,
    depth: 0.084,
    height: 0.025,
    source: streamDeckSpecs,
    scale: specs(
      streamDeckSpecs,
      "Stream Deck MK.2 · Without stand",
      "Published 118 × 84 × 25 mm without the detachable stand. Preview lies flat. The supplier hero photo includes the stand; the faceplate photo shows the unit without it. LCD icons are illustrative. This is MK.2, not the newer Scissor Keys model.",
    ),
  },
];
