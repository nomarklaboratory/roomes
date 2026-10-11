import { cn } from "@/lib/cn";
import type { HoldCueAction } from "@/types/viewer";
import { Icon } from "./icon";
import { ProductActionWheelArt } from "./product-action-wheel-art";

const actions = [
  {
    id: "duplicate",
    label: "Duplicate",
    icon: "plus",
    position: "left-1/2 top-[15%]",
  },
  { id: "move", label: "Move", icon: "move", position: "left-[15%] top-1/2" },
  {
    id: "inspect",
    label: "Inspect",
    icon: "eye",
    position: "left-[85%] top-1/2",
  },
  {
    id: "delete",
    label: "Delete",
    icon: "trash",
    position: "left-1/2 top-[85%]",
  },
] as const;

export function ProductActionWheel({
  action,
  canMove,
  canDelete,
  canDuplicate,
}: {
  action?: HoldCueAction | null;
  canMove: boolean;
  canDelete: boolean;
  canDuplicate: boolean;
}) {
  return (
    <div
      data-product-wheel
      data-action={action ?? "none"}
      className="absolute left-1/2 top-1/2 size-[264px] -translate-x-1/2 -translate-y-1/2 max-[700px]:size-[240px]"
    >
      <ProductActionWheelArt
        selected={action}
        canMove={canMove}
        canDelete={canDelete}
        canDuplicate={canDuplicate}
      />
      {actions.map(({ id, label, icon, position }) => {
        const enabled =
          id === "inspect" ||
          (id === "duplicate"
            ? canDuplicate
            : id === "move"
              ? canMove
              : canDelete);
        return (
          <span
            key={id}
            className={cn(
              "absolute flex w-[88px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 whitespace-nowrap text-center text-base font-medium text-white transition-transform duration-100",
              position,
              !enabled && "opacity-30",
              action === id && "scale-110 font-semibold text-[#263b25]",
            )}
          >
            <Icon name={icon} size={24} />
            {label}
          </span>
        );
      })}
      <span className="absolute left-1/2 top-1/2 flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center text-base leading-snug text-white">
        {action ? (
          <>
            <span className="text-white/70">Release to</span>
            <strong className="font-semibold capitalize">
              {action === "duplicate" ? "Duplicate" : action}
            </strong>
          </>
        ) : (
          "Slide to choose"
        )}
      </span>
    </div>
  );
}
