import type { Finish, Product, ScaleEvidence } from "../types/catalog.ts";
import { mediaByProduct } from "./product-media-data.ts";
import { deskAccessories } from "./desk-accessories.ts";
export type {
  Category,
  AccessoryKind,
  Product,
  ScaleEvidence,
  Finish,
  Weeks,
  PresetId,
} from "../types/catalog.ts";

const checkedAt = "2026-10-11";
const hm = "https://ukstore.hermanmiller.com/products/";
const dell = "https://www.dell.com/en-us/shop/monitors/apd/";
function evidence(
  source: string,
  model: string,
  note: string,
  extra: Partial<ScaleEvidence> = {},
): ScaleEvidence {
  return { status: "listed", source, model, checkedAt, note, ...extra };
}
const productData: readonly Omit<
  Product,
  "assetPath" | "assetVersion" | "media"
>[] = [
  ...deskAccessories,
  {
    id: "torq-mod-fun",
    name: "Torq Mod Fun Surfboard",
    brand: "Torq",
    model: "TET Mod Fun · 6′8″",
    subtitle: "6′8″ · Blue pinline · Back-wall display",
    category: "accessory",
    kind: "surfboard",
    mount: "back-wall",
    weeklyCents: 500,
    width: 2.032,
    depth: 0.06985,
    height: 0.5334,
    source: "https://www.torq-surfboards.com/midlength/mod-fun.html",
    scale: evidence(
      "https://www.torq-surfboards.com/midlength/mod-fun.html",
      "Torq TET Mod Fun · 6′8″ × 21″ × 2¾″",
      "Mounted horizontally: W × D × H means board length × thickness × width. Fins removed for display; mounting hardware is illustrative. Original stylized model. Supplier photos show the related 7′2″ shape and alternative pinline colors, not the preview size. Rental stock is unverified.",
    ),
  },
  {
    id: "jarvis-bamboo",
    name: "Jarvis Bamboo",
    brand: "Fully · Herman Miller",
    model: "Jarvis Bamboo · 1200 × 800",
    subtitle: "120 × 80 cm · Natural bamboo · Black frame",
    category: "desk",
    weeklyCents: 500,
    width: 1.2,
    depth: 0.8,
    height: 0.75,
    finishes: ["bamboo"],
    source: `${hm}jarvis-bamboo-standing-desk`,
    scale: evidence(
      `${hm}jarvis-bamboo-standing-desk`,
      "Jarvis Bamboo · 120 × 80 cm",
      "Rectangular top, black frame, up/down controls, no powered grommets. Preview at 75 cm; adjustable 64.2–129 cm.",
      { heightRange: [0.642, 1.29] },
    ),
  },
  {
    id: "jarvis-laminate",
    name: "Jarvis Laminate",
    brand: "Fully · Herman Miller",
    model: "Jarvis Laminate · 1600 × 800",
    subtitle: "160 × 80 cm · Laminate · Black frame",
    category: "desk",
    weeklyCents: 700,
    width: 1.6,
    depth: 0.8,
    height: 0.75,
    finishes: ["white", "black"],
    source: `${hm}jarvis-laminate-standing-desk`,
    scale: evidence(
      `${hm}jarvis-laminate-standing-desk`,
      "Jarvis Laminate · 160 × 80 cm",
      "Rectangular top, black frame and up/down controls. Preview at 75 cm; adjustable 64.2–129 cm. Finishes follow the current UK catalog.",
      { heightRange: [0.642, 1.29] },
    ),
  },
  {
    id: "herman-miller-aeron",
    name: "Aeron",
    brand: "Herman Miller",
    model: "Aeron · B · Graphite",
    subtitle: "Size B · Graphite · Pellicle mesh",
    category: "chair",
    weeklyCents: 600,
    width: 0.71882,
    depth: 0.6985,
    height: 1.0088,
    seatHeight: 0.45,
    seat: { width: 0.5, depth: 0.4318 },
    source: `${hm}aeron-office-chair`,
    scale: evidence(
      "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/",
      "Aeron B · height-adjustable arms",
      "Graphite frame with height-adjustable arms. Published envelope; upright preview at a 45 cm seat height. Seat width and curved surfaces are stylized. Size B seat depth is 17 inches.",
      { heightRange: [0.93472, 1.04394], seatHeightRange: [0.37592, 0.57912] },
    ),
  },
  {
    id: "herman-miller-sayl",
    name: "Sayl",
    brand: "Herman Miller",
    model: "Sayl · Black · Kingsmead",
    subtitle: "Suspension back · Black Kingsmead seat",
    category: "chair",
    weeklyCents: 400,
    width: 0.622,
    depth: 0.502,
    height: 0.959,
    seatHeight: 0.419,
    seat: { width: 0.464, depth: 0.406 },
    source: `${hm}sayl-office-chair`,
    scale: evidence(
      `${hm}sayl-office-chair`,
      "Sayl · fixed arms · Kingsmead",
      "Black suspension back, fixed arms and Kingsmead upholstered seat. Upright preview at minimum listed seat height; suspension lattice is stylized.",
      { heightRange: [0.959, 1.035], seatHeightRange: [0.419, 0.559] },
    ),
  },
  {
    id: "dell-u2725qe",
    name: "Dell UltraSharp 27",
    brand: "Dell",
    model: "U2725QE",
    subtitle: "27-inch 4K · Thunderbolt hub",
    category: "accessory",
    kind: "monitor",
    weeklyCents: 1300,
    width: 0.61244,
    depth: 0.189,
    height: 0.53568,
    screen: { inches: 27, aspect: 16 / 9 },
    source: `${dell}dell-ultrasharp-27-4k-thunderbolt-hub-monitor-u2725qe/u2725qe_monitor/-`,
    scale: evidence(
      `${dell}dell-ultrasharp-27-4k-thunderbolt-hub-monitor-u2725qe/u2725qe_monitor/-`,
      "Dell U2725QE",
      "Dimensions include the stand at its fully extended height. Screen size is the active display diagonal.",
      { heightRange: [0.38568, 0.53568] },
    ),
  },
  {
    id: "dell-u3425we",
    name: "Dell UltraSharp 34",
    brand: "Dell",
    model: "U3425WE",
    subtitle: "34.1-inch curved · Thunderbolt hub",
    category: "accessory",
    kind: "monitor",
    weeklyCents: 1900,
    width: 0.81346,
    depth: 0.24043,
    height: 0.54283,
    screen: { inches: 34.1, aspect: 3440 / 1440, radius: 1.9 },
    source:
      "https://www.dell.com/en-us/shop/dell-ultrasharp-34-curved-thunderbolt-hub-monitor-u3425we/apd/210-bmds",
    scale: evidence(
      "https://www.delltechnologies.com/asset/en-in/products/electronics-and-accessories/technical-support/dell-ultrasharp-34-curved-thunderbolt-hub-monitor-u3425we-datasheet.pdf",
      "Dell U3425WE",
      "Published dimensions with stand fully extended. The 1900R screen curvature is represented in the preview.",
      { heightRange: [0.39283, 0.54283] },
    ),
  },
  {
    id: "benq-wit",
    name: "BenQ WiT",
    brand: "BenQ",
    model: "WiT · Silver",
    subtitle: "Silver · Articulated e-reading lamp",
    category: "accessory",
    kind: "lamp",
    weeklyCents: 300,
    width: 0.59,
    depth: 0.22,
    height: 0.625,
    source:
      "https://www.benq.com/en-sg/lighting/e-reading-desk-lamp/e-reading.html",
    scale: evidence(
      "https://www.benq.com/en-au/lighting/e-reading-desk-lamp/e-reading/spec.html",
      "BenQ WiT",
      "Published 59 × 22 × 62.5 cm envelope. Adjustable arms use one illustrative pose; their footprint changes with articulation.",
    ),
  },
  {
    id: "ikea-fejka",
    name: "FEJKA Rosemary",
    brand: "IKEA",
    model: "FEJKA · 206.107.45",
    subtitle: "Artificial plant · 9 cm nursery pot",
    category: "accessory",
    kind: "plant",
    weeklyCents: 200,
    width: 0.21,
    depth: 0.21,
    height: 0.21,
    source:
      "https://www.ikea.com/ph/en/p/fejka-artificial-potted-plant-indoor-outdoor-rosemary-20610745/",
    scale: evidence(
      "https://www.ikea.com/ph/en/p/fejka-artificial-potted-plant-indoor-outdoor-rosemary-20610745/",
      "IKEA FEJKA Rosemary",
      "Published plant height 21 cm and pot diameter 9 cm. Foliage spread is estimated at 21 cm from the product and packaging; leaves are stylized.",
      { status: "estimated" },
    ),
  },
  {
    id: "twelve-south-curve",
    name: "Twelve South Curve",
    brand: "Twelve South",
    model: "Curve · Matte black",
    subtitle: "Stand only · Aluminium and silicone",
    category: "accessory",
    kind: "stand",
    weeklyCents: 200,
    width: 0.263,
    depth: 0.222,
    height: 0.149,
    source: "https://www.twelvesouth.com/products/curve-for-macbook",
    scale: evidence(
      "https://twelvesouth.co.uk/products/curve-for-macbook",
      "Twelve South Curve",
      "Manufacturer lists 26.3 × 22.2 × 14.9 cm. Laptop shown in supplier photos is for context and is not included.",
    ),
  },
];
export const products: readonly Product[] = productData.map((product) => ({
  ...product,
  assetVersion: 4,
  assetPath: `/models/${product.id}.glb?v=4`,
  media: mediaByProduct[product.id],
}));
export const catalog = Object.fromEntries(
  products.map((p) => [p.id, p]),
) as Record<string, Product>;
export const finishes = [
  {
    id: "bamboo",
    name: "Natural bamboo",
    color: "#cda773",
    swatch: "bg-[#cda773]",
  },
  {
    id: "white",
    name: "White laminate",
    color: "#f4f2ed",
    swatch: "bg-[#f4f2ed]",
  },
  {
    id: "black",
    name: "Black laminate",
    color: "#30302e",
    swatch: "bg-[#30302e]",
  },
] as const;
export function finishesFor(productId: string) {
  return finishes.filter((f) => catalog[productId]?.finishes?.includes(f.id));
}
export function normalizeFinish(productId: string, finish: Finish): Finish {
  const allowed = finishesFor(productId);
  if (allowed.some((f) => f.id === finish)) return finish;
  return allowed[0]?.id ?? "bamboo";
}
export function productHero(product: Product, finish?: Finish) {
  const images = product.media.filter((media) => media.kind === "image");
  return images.find((media) => media.finish === finish) ?? images[0];
}
export function dimensionLabel(product: Product) {
  const cm = (metres: number) => Number((metres * 100).toFixed(1));
  return `${cm(product.width)} × ${cm(product.depth)} × ${cm(product.height)} cm`;
}
export function scaleLabel(product: Product) {
  return product.scale.status === "listed"
    ? "Published dimensions"
    : "Estimated foliage spread";
}
export const durations = [1, 2, 4, 8] as const;
export const presets = [
  {
    id: "essentials",
    name: "The essentials",
    description: "Less stuff. More headspace.",
    room: "sand",
    desk: "jarvis-bamboo",
    chair: "herman-miller-sayl",
    extras: ["benq-wit"],
    finish: "bamboo",
  },
  {
    id: "developer",
    name: "Deep focus",
    description: "A home for your next big idea.",
    room: "sage",
    desk: "jarvis-bamboo",
    chair: "herman-miller-aeron",
    extras: ["dell-u2725qe", "benq-wit"],
    finish: "bamboo",
  },
  {
    id: "creative",
    name: "Room to create",
    description: "Spread out. Think a little bigger.",
    room: "clay",
    desk: "jarvis-laminate",
    chair: "herman-miller-sayl",
    extras: ["dell-u3425we", "ikea-fejka", "twelve-south-curve"],
    finish: "white",
  },
] as const;
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100);
