import { catalog } from "@/lib/catalog";
import {
  allowedSlots,
  type Action,
  type Setup,
  type Slot,
} from "@/lib/workspace";
import { positionOf } from "@/lib/placement";
import { Icon } from "./icon";
import { SitInChairButton } from "./sit-in-chair-button";
import { ProductScaleDetails } from "./product-dimensions";
import { PrecisePlacement } from "./precise-placement";
import { useEditorStore } from "./studio-provider";

function productIdForSelection(
  setup: Setup,
  selected: string,
  item?: Setup["items"][number],
) {
  if (selected === "desk") return setup.deskId;
  if (selected === "chair") return setup.chairId;
  return item?.productId ?? "";
}

export function PlacementControls({
  setup,
  selected,
  onChange,
  onClose,
  onSit,
}: {
  setup: Setup;
  selected: string;
  onChange: (action: Action) => void;
  onClose: () => void;
  onSit: () => void;
}) {
  const moving = useEditorStore((state) => state.session !== null);
  const item = setup.items.find((i) => i.id === selected);
  const product = catalog[productIdForSelection(setup, selected, item)];
  if (!product) return null;
  const point = positionOf(setup, selected);
  const wall = product.mount === "back-wall";
  const increment = item && !wall ? 0.02 : 0.1;
  const slots = item ? allowedSlots(setup, item) : [];
  const directions = [
    { label: "left", icon: "back", x: -increment, z: 0 },
    { label: wall ? "up" : "forward", icon: "up", x: 0, z: -increment },
    { label: wall ? "down" : "backward", icon: "down", x: 0, z: increment },
    { label: "right", icon: "arrow", x: increment, z: 0 },
  ] as const;
  return (
    <>
      <div className="placement-panel flex items-center gap-[0.9375rem] mt-2 p-3 bg-[#edf1e4] border border-[#d8dfcb] rounded-[0.625rem] [&_>_div:first-child]:flex-1 [&_strong]:block [&_strong]:text-base [&_strong]:font-[550] [&_small]:block [&_small]:mt-[0.1875rem] [&_small]:text-base [&_small]:text-[#7a856b] max-[700px]:flex-wrap max-[700px]:relative max-[700px]:p-[0.625rem] max-[700px]:gap-[0.4375rem] max-[700px]:[&_.placement-title]:basis-[calc(100%_-_2.5rem)] max-[700px]:[&_>_.icon-button]:absolute max-[700px]:[&_>_.icon-button]:top-2 max-[700px]:[&_>_.icon-button]:right-2 max-[700px]:[&_>_.icon-button]:w-9 max-[700px]:[&_>_.icon-button]:h-9 max-[700px]:[&_strong]:text-base max-[700px]:[&_small]:text-base">
        <div className="placement-title flex gap-[0.625rem] items-center">
          <span className="placement-symbol flex items-center justify-center w-8 h-8 rounded-full bg-[#dce6cd] text-[#536a40]">
            <Icon name="move" size={18} />
          </span>
          <div>
            <strong>{product.name}</strong>
            <small>
              Drag in 3D or adjust by {Math.round(increment * 100)} cm
            </small>
            <span className="position-readout block mt-[0.4375rem] text-base tracking-[0.0375rem] text-[#6a785c]">
              {wall ? "BACK WALL" : item ? "DESK" : "ROOM"} · X{" "}
              {Math.round(point.x * 100)} / {wall ? "HEIGHT" : "Z"}{" "}
              {Math.round((wall ? (point.y ?? 0) : point.z) * 100)} cm
            </span>
          </div>
        </div>
        <div className="placement-tools flex flex-col gap-[0.375rem] max-[700px]:w-full max-[700px]:flex-row max-[700px]:flex-wrap max-[700px]:gap-2">
          {selected === "chair" && (
            <SitInChairButton onSit={onSit} label="Sit in this chair" />
          )}
          <div
            className="nudge-buttons flex gap-1 [&_button]:w-9 [&_button]:h-9 [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:border [&_button]:border-[#dae0ce] [&_button]:rounded-[0.3125rem] [&_button]:bg-[#f8f9f1] [&_button]:text-[#4f6341] [&_button:hover]:bg-[#dce6cd] max-[700px]:[&_button]:w-11 max-[700px]:[&_button]:h-11"
            aria-label={`Move ${product.name}`}
          >
            {directions.map(({ label, icon, x, z }) => (
              <button
                key={label}
                aria-label={`Move ${product.name} ${label}`}
                onClick={() =>
                  onChange({
                    type: "place",
                    id: selected,
                    position: {
                      x: point.x + x,
                      z: wall ? point.z : point.z + z,
                      ...(wall ? { y: (point.y ?? 0) - z } : {}),
                    },
                  })
                }
              >
                <Icon name={icon} size={16} />
              </button>
            ))}
            <button
              aria-label={`Reset ${product.name} position`}
              onClick={() => onChange({ type: "reset-position", id: selected })}
            >
              <Icon name="reset" size={16} />
            </button>
          </div>
          {item && !wall && (
            <div
              className="slot-buttons flex gap-1 [&_button]:bg-[#f8f9f1] [&_button]:border [&_button]:border-[#dae0ce] [&_button]:rounded-[0.3125rem] [&_button]:min-h-[2.125rem] [&_button]:py-0 [&_button]:px-[0.6875rem] [&_button]:text-base [&_button]:capitalize [&_button[aria-pressed='true']]:bg-[#536a40] [&_button[aria-pressed='true']]:text-[white] [&_button[aria-pressed='true']]:border-[#536a40] max-[700px]:[&_button]:min-h-11 max-[700px]:[&_button]:py-0 max-[700px]:[&_button]:px-2 max-[700px]:[&_button]:text-base"
              aria-label="Quick desk positions"
            >
              {(product.kind === "monitor"
                ? ["rear-left", "rear-center", "rear-right"]
                : ["front-left", "front-center", "front-right"]
              ).map((s) => (
                <button
                  key={s}
                  disabled={!slots.includes(s as Slot)}
                  aria-pressed={!item.position && item.slot === s}
                  onClick={() =>
                    onChange({ type: "move", id: selected, slot: s as Slot })
                  }
                >
                  {s.split("-")[1]}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          className="icon-button inline-flex items-center justify-center border border-[#dee2d4] bg-transparent w-8 h-8 rounded-[0.4375rem] p-0 max-[700px]:min-h-9 max-[700px]:min-w-9"
          aria-label="Close movement controls"
          onClick={onClose}
        >
          <Icon name="close" size={16} />
        </button>
      </div>
      <ProductScaleDetails product={product} />
      <PrecisePlacement
        key={`${selected}-${product.id}-${point.x}-${point.z}-${point.y}-${setup.room.width}-${setup.room.depth}-${setup.room.height}-${setup.deskId}`}
        setup={setup}
        id={selected}
        onChange={onChange}
        disabled={moving}
      />
    </>
  );
}
