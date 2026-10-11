"use client";

import { productFor } from "@/lib/placement";
import type { Setup } from "@/types/workspace";
import type { ProductMoveController } from "@/types/product-interaction";
import { Icon } from "./icon";
import { useEditorStore } from "./studio-provider";

export function ProductMoveControls({
  setup,
  movement,
}: {
  setup: Setup;
  movement: ProductMoveController;
}) {
  const id = useEditorStore((state) => state.session?.id);
  const pointerType = useEditorStore(
    (state) => state.session?.anchor.pointerType,
  );
  if (!id) return null;
  const product = productFor(setup, id);

  return (
    <div
      role="region"
      aria-label={`Move ${product?.name ?? "product"}`}
      data-move-mode
      className="absolute left-1/2 top-4 z-20 w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-[#a5b595] bg-[#f7f7ef]/95 p-4 text-base text-[#263b25] shadow-xl backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 font-semibold">
        <Icon name="move" />
        <span role="status">Moving {product?.name ?? "product"}</span>
      </div>
      <p className="mt-2 text-stone-600">
        {pointerType === "mouse"
          ? "Move the pointer to position. Click to place."
          : "Drag to position. Tap Place when ready."}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[#3f583b]">
          <Icon name="lock" size={18} /> Camera locked
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={movement.cancel}
            className="min-h-11 rounded-lg border border-[#a5b595] bg-white px-3 hover:bg-[#edf2e7]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={movement.confirm}
            className="flex min-h-11 items-center gap-2 rounded-lg bg-[#344c32] px-3 text-white hover:bg-[#263b25]"
          >
            <Icon name="check" size={18} /> Place
          </button>
        </div>
      </div>
    </div>
  );
}
