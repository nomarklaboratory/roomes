export type Category = "desk" | "chair" | "accessory";
export type AccessoryKind =
  | "monitor"
  | "lamp"
  | "plant"
  | "stand"
  | "surfboard"
  | "desk-mat"
  | "mouse-pad"
  | "keyboard"
  | "mouse"
  | "controller";
export type Finish = "bamboo" | "white" | "black";
export type Weeks = 1 | 2 | 4 | 8;
export type PresetId = "essentials" | "developer" | "creative";

export type ScaleEvidence = {
  status: "listed" | "estimated";
  model?: string;
  source: string;
  checkedAt: string;
  note: string;
  heightRange?: readonly [number, number];
  seatHeightRange?: readonly [number, number];
};

export type MediaBase = {
  id: string;
  src: string;
  caption: string;
  source: string;
  variant: string;
  finish?: Finish;
};
export type ProductImage = MediaBase & {
  kind: "image";
  presentation: "photo" | "render" | "catalog";
  alt: string;
};
export type ProductVideo = MediaBase & {
  kind: "video";
  poster: string;
};
export type ProductMedia = ProductImage | ProductVideo;

export type Product = {
  id: string;
  name: string;
  brand: string;
  model: string;
  subtitle: string;
  category: Category;
  assetPath: string;
  weeklyCents: number;
  width: number;
  depth: number;
  height: number;
  seatHeight?: number;
  seat?: { width: number; depth: number };
  assetVersion: number;
  kind?: AccessoryKind;
  mount?: "back-wall";
  source: string;
  scale: ScaleEvidence;
  screen?: { inches: number; aspect: number; radius?: number };
  finishes?: readonly Finish[];
  media: readonly ProductMedia[];
};
