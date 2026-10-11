import type { HoldCueAction } from "@/types/viewer";

export function productHoldAction(
  x: number,
  y: number,
  canMove: boolean,
  canDelete: boolean,
  canDuplicate: boolean,
): HoldCueAction | null {
  if (Math.hypot(x, y) < 40) return null;
  const angle = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  if (angle >= 45 && angle < 135) return canDelete ? "delete" : null;
  if (angle >= 135 && angle < 225) return canMove ? "move" : null;
  if (angle >= 225 && angle < 315) return canDuplicate ? "duplicate" : null;
  return "inspect";
}
