export type Category = "desk" | "chair" | "accessory";
export type AccessoryKind = "monitor" | "lamp" | "plant" | "stand";
export type Product = {
  id: string;
  name: string;
  subtitle: string;
  category: Category;
  assetPath: string;
  weeklyCents: number;
  width: number;
  depth: number;
  height: number;
  kind?: AccessoryKind;
  concept?: boolean;
  source?: string;
};

// A replaceable catalog adapter. Dimensions drive placement; prices are demo data.
const productData: readonly Omit<Product, "assetPath">[] = [
  {
    id: "electric-desk",
    name: "Electric desk",
    subtitle: "120 × 60 cm · Sit / stand",
    category: "desk",
    weeklyCents: 500,
    width: 1.2,
    depth: 0.6,
    height: 0.75,
    source: "https://www.monis.rent/products/electrical-adjustable-desk",
  },
  {
    id: "wooden-desk",
    name: "Wooden desk",
    subtitle: "160 × 80 cm · More room to create",
    category: "desk",
    weeklyCents: 700,
    width: 1.6,
    depth: 0.8,
    height: 0.75,
    source: "https://www.monis.rent/products/adjustable-wooden-desk",
  },
  {
    id: "ergonomic-chair",
    name: "Ergonomic chair",
    subtitle: "Headrest · Adjustable support",
    category: "chair",
    weeklyCents: 600,
    width: 0.65,
    depth: 0.65,
    height: 1.2,
    source: "https://www.monis.rent/products/ergonomic-office-chair",
  },
  {
    id: "task-chair",
    name: "Everyday chair",
    subtitle: "Soft curves · Easy-going comfort",
    category: "chair",
    weeklyCents: 400,
    width: 0.6,
    depth: 0.6,
    height: 0.95,
    concept: true,
  },
  {
    id: "monitor-27",
    name: "27″ monitor",
    subtitle: "A little more screen space",
    category: "accessory",
    kind: "monitor",
    weeklyCents: 1300,
    width: 0.61,
    depth: 0.2,
    height: 0.43,
    source: "https://www.monis.rent/",
  },
  {
    id: "monitor-34",
    name: "34″ ultrawide",
    subtitle: "Your ideas, side by side",
    category: "accessory",
    kind: "monitor",
    weeklyCents: 1900,
    width: 0.81,
    depth: 0.2,
    height: 0.43,
    source: "https://www.monis.rent/",
  },
  {
    id: "desk-lamp",
    name: "Desk lamp",
    subtitle: "A warm glow for late ideas",
    category: "accessory",
    kind: "lamp",
    weeklyCents: 300,
    width: 0.16,
    depth: 0.16,
    height: 0.48,
    source: "https://www.monis.rent/",
  },
  {
    id: "plant",
    name: "Little green friend",
    subtitle: "Bring a bit of Bali inside",
    category: "accessory",
    kind: "plant",
    weeklyCents: 200,
    width: 0.19,
    depth: 0.19,
    height: 0.35,
    concept: true,
  },
  {
    id: "laptop-stand",
    name: "Laptop stand",
    subtitle: "Lift your everyday view",
    category: "accessory",
    kind: "stand",
    weeklyCents: 200,
    width: 0.28,
    depth: 0.24,
    height: 0.15,
    source: "https://www.monis.rent/",
  },
];
export const products: readonly Product[] = productData.map((product) => ({
  ...product,
  assetPath: `/models/${product.id}.glb`,
}));
export const catalog = Object.fromEntries(
  products.map((p) => [p.id, p]),
) as Record<string, Product>;
export const finishes = [
  { id: "oat", name: "Natural oak", color: "#c9a77f" },
  { id: "walnut", name: "Warm walnut", color: "#76503c" },
  { id: "chalk", name: "Soft white", color: "#e4ded1" },
] as const;
export type Finish = (typeof finishes)[number]["id"];
export const durations = [1, 2, 4, 8] as const;
export type Weeks = (typeof durations)[number];
export const presets = [
  {
    id: "essentials",
    name: "The essentials",
    description: "Less stuff. More headspace.",
    room: "sand",
    desk: "electric-desk",
    chair: "task-chair",
    extras: ["desk-lamp"],
    finish: "oat",
  },
  {
    id: "developer",
    name: "Deep focus",
    description: "A home for your next big idea.",
    room: "sage",
    desk: "electric-desk",
    chair: "ergonomic-chair",
    extras: ["monitor-27", "desk-lamp"],
    finish: "oat",
  },
  {
    id: "creative",
    name: "Room to create",
    description: "Spread out. Think a little bigger.",
    room: "clay",
    desk: "wooden-desk",
    chair: "task-chair",
    extras: ["monitor-34", "plant", "laptop-stand"],
    finish: "walnut",
  },
] as const;
export type PresetId = (typeof presets)[number]["id"];
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100);
