import type { Point } from "./placement";

export interface ProductPointer {
  clientX: number;
  clientY: number;
  pointerType: string;
}

export interface ProductMoveSession {
  id: string;
  origin: Point;
  position: Point;
  anchor: ProductPointer;
}

export interface ProductMoveController {
  getSession: () => ProductMoveSession | null;
  isLocked: () => boolean;
  hold: (id: string) => void;
  releaseHold: (id: string) => void;
  begin: (id: string, anchor: ProductPointer) => void;
  update: (position: Point) => void;
  confirm: () => void;
  cancel: () => void;
}
