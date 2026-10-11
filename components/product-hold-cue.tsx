"use client";

import { cn } from "@/lib/cn";
import type { HoldCueAction, HoldCuePhase } from "@/types/viewer";
import { ProductActionWheel } from "./product-action-wheel";
import { ProductHoldRing } from "./product-hold-ring";

export function ProductHoldCue({
  x,
  y,
  phase,
  action,
  canMove,
  canDelete,
  canDuplicate,
}: {
  x: number;
  y: number;
  phase: HoldCuePhase;
  action?: HoldCueAction | null;
  canMove: boolean;
  canDelete: boolean;
  canDuplicate: boolean;
}) {
  const charging = phase === "charging";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
    >
      {phase === "menu" ? (
        <ProductActionWheel
          action={action}
          canMove={canMove}
          canDelete={canDelete}
          canDuplicate={canDuplicate}
        />
      ) : (
        <>
          <ProductHoldRing charging={charging} />
          <span
            className={cn(
              "absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/80 bg-[#344c32] px-3 py-2 text-base font-medium text-white shadow-lg",
              charging && "bg-[#263b25]",
            )}
          >
            {charging ? "Keep holding…" : "Hold to choose"}
          </span>
        </>
      )}
    </div>
  );
}
