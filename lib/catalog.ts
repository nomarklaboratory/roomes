export type Category = "desk" | "chair" | "accessory";
export type AccessoryKind = "monitor" | "lamp" | "plant" | "stand";
export type ScaleEvidence = {
  status: "listed" | "estimated" | "concept";
  model?: string;
  source?: string;
  checkedAt?: string;
  note: string;
  heightRange?: readonly [number, number];
  seatHeightRange?: readonly [number, number];
};
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
  seatHeight?: number;
  assetVersion?: number;
  kind?: AccessoryKind;
  concept?: boolean;
  source?: string;
  scale: ScaleEvidence;
  screen?: { inches: number; aspect: number };
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
    assetVersion: 3,
    source: "https://www.monis.rent/products/electrical-adjustable-desk",
    scale: {
      status: "listed",
      model: "Fantech WS414 / GD914 · Small",
      source: "https://www.monis.rent/products/electrical-adjustable-desk",
      checkedAt: "2026-10-11",
      note: "120 × 60 cm variant. Preview set at 75 cm; adjustable 70–118 cm.",
      heightRange: [0.7, 1.18],
    },
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
    assetVersion: 3,
    source: "https://www.monis.rent/products/adjustable-wooden-desk",
    scale: {
      status: "listed",
      model: "IKEA Trotten · 160 × 80 cm",
      source: "https://www.monis.rent/products/adjustable-wooden-desk",
      checkedAt: "2026-10-11",
      note: "160 × 80 cm selector and technical specifications; summary differs. Preview set at 75 cm; adjustable 70–120 cm. Confirm variant before ordering.",
      heightRange: [0.7, 1.2],
    },
  },
  {
    id: "ergonomic-chair",
    name: "Ergonomic chair",
    subtitle: "Headrest · Adjustable support",
    category: "chair",
    weeklyCents: 600,
    width: 0.65,
    depth: 0.66,
    height: 1.15,
    seatHeight: 0.49,
    assetVersion: 3,
    source: "https://www.monis.rent/products/ergonomic-office-chair",
    scale: {
      status: "listed",
      model: "Fantech OCA259PRO",
      source:
        "https://fantech.ph/wp-content/uploads/2024/10/oca259-pro-black-7.jpg",
      checkedAt: "2026-10-11",
      note: "Manufacturer diagram: arms 61–65 cm wide, base 66 cm deep, seat 50 × 48 cm. Preview uses minimum seat / overall height, arms at widest setting, leg rest retracted.",
      heightRange: [1.15, 1.28],
      seatHeightRange: [0.49, 0.57],
    },
  },
  {
    id: "task-chair",
    name: "Everyday chair",
    subtitle: "Soft curves · Easy-going comfort",
    category: "chair",
    weeklyCents: 400,
    width: 0.6,
    depth: 0.6,
    height: 0.83,
    seatHeight: 0.46,
    assetVersion: 3,
    concept: true,
    scale: {
      status: "concept",
      note: "Original concept; 46 cm seat height. No matching rental SKU.",
    },
  },
  {
    id: "monitor-27",
    name: "27″ monitor",
    subtitle: "A little more screen space",
    category: "accessory",
    kind: "monitor",
    weeklyCents: 1300,
    width: 0.6129,
    depth: 0.2,
    height: 0.5149,
    assetVersion: 3,
    screen: { inches: 27, aspect: 16 / 9 },
    source: "https://www.monis.rent/products/27-4-k-multimedia-monitor",
    scale: {
      status: "listed",
      model: "Redmi A27U / Xiaomi A27Ui",
      source: "https://www.monis.rent/products/27-4-k-multimedia-monitor",
      checkedAt: "2026-10-11",
      note: "Listed assembled dimensions including stand: 612.9 × 200 × 514.9 mm. Preview uses this stand position.",
    },
  },
  {
    id: "monitor-34",
    name: "34″ ultrawide",
    subtitle: "Your ideas, side by side",
    category: "accessory",
    kind: "monitor",
    weeklyCents: 1900,
    width: 0.81039,
    depth: 0.24253,
    height: 0.52061,
    assetVersion: 3,
    screen: { inches: 34, aspect: 3440 / 1440 },
    source: "https://www.monis.rent/products/4-k-ultra-wide-34",
    scale: {
      status: "listed",
      model: "Xiaomi Mi Curved 34 · 144 Hz",
      source:
        "https://i01.appmifile.com/webfile/globalimg/Global_UG/Mi_Ecosystem/Mi_Curved_Gaming_Monitor_34/Mi_CurvedMonitor_34_All_V1.pdf",
      checkedAt: "2026-10-11",
      note: "Manufacturer manual gives width 810.39, depth 242.53, height 520.61 mm including stand. Resolves swapped depth/height labels on the rental listing. Stylized screen; curvature is not reproduced.",
    },
  },
  {
    id: "desk-lamp",
    name: "Desk lamp",
    subtitle: "A warm glow for late ideas",
    category: "accessory",
    kind: "lamp",
    weeklyCents: 300,
    width: 0.15,
    depth: 0.44,
    height: 0.42,
    assetVersion: 3,
    source: "https://www.monis.rent/products/smart-led-desk-lamp-1-s",
    scale: {
      status: "listed",
      model: "Xiaomi Mi LED Desk Lamp 1S",
      source: "https://www.mi.com/sg/support/faq/details/KA-07549/",
      checkedAt: "2026-10-11",
      note: "Manufacturer's opened posture: 440 × 150 × 420 mm, 150 mm base. Arm faces forward, so room width is 150 mm and depth is 440 mm. Rental listing's 162 × 162 × 479 mm does not describe this opened posture.",
    },
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
    assetVersion: 3,
    scale: {
      status: "concept",
      note: "Original plant concept; size is an illustration, not a rental SKU.",
    },
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
    assetVersion: 3,
    source: "https://www.monis.rent/products/ergonomic-laptop-stand",
    scale: {
      status: "estimated",
      model: "KOLMI",
      source: "https://www.monis.rent/products/ergonomic-laptop-stand",
      checkedAt: "2026-10-11",
      note: "Rental listing identifies KOLMI but publishes no dimensions. 28 × 24 × 15 cm is an estimate pending measurement of the actual stock.",
    },
  },
];
export const products: readonly Product[] = productData.map((product) => ({
  ...product,
  assetPath: `/models/${product.id}.glb?v=${product.assetVersion ?? 1}`,
}));
export const catalog = Object.fromEntries(
  products.map((p) => [p.id, p]),
) as Record<string, Product>;
export function dimensionLabel(product: Product) {
  const cm = (metres: number) => Number((metres * 100).toFixed(1));
  return `${cm(product.width)} × ${cm(product.depth)} × ${cm(product.height)} cm`;
}
export function scaleLabel(product: Product) {
  return product.scale.status === "listed"
    ? "Published dimensions"
    : product.scale.status === "estimated"
      ? "Estimated dimensions"
      : "Concept dimensions";
}
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
