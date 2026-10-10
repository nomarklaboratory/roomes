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
  const item = setup.items.find((i) => i.id === selected);
  const product =
    catalog[
      selected === "desk"
        ? setup.deskId
        : selected === "chair"
          ? setup.chairId
          : (item?.productId ?? "")
    ];
  if (!product) return null;
  const point = positionOf(setup, selected);
  const increment = item ? 0.02 : 0.1;
  const slots = item ? allowedSlots(setup, item) : [];
  const directions = [
    { label: "left", icon: "back", x: -increment, z: 0 },
    { label: "forward", icon: "up", x: 0, z: -increment },
    { label: "backward", icon: "down", x: 0, z: increment },
    { label: "right", icon: "arrow", x: increment, z: 0 },
  ] as const;
  return (
    <div className="placement-panel">
      <div className="placement-title">
        <span className="placement-symbol">
          <Icon name="move" size={18} />
        </span>
        <div>
          <strong>{product.name}</strong>
          <small>
            Drag in 3D or adjust by {Math.round(increment * 100)} cm
          </small>
          <span className="position-readout">
            {item ? "DESK" : "ROOM"} · X {Math.round(point.x * 100)} / Z{" "}
            {Math.round(point.z * 100)} cm
          </span>
        </div>
      </div>
      <div className="placement-tools">
        {selected === "chair" && (
          <SitInChairButton onSit={onSit} label="Sit in this chair" />
        )}
        <div className="nudge-buttons" aria-label={`Move ${product.name}`}>
          {directions.map(({ label, icon, x, z }) => (
            <button
              key={label}
              aria-label={`Move ${product.name} ${label}`}
              onClick={() =>
                onChange({
                  type: "place",
                  id: selected,
                  position: { x: point.x + x, z: point.z + z },
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
        {item && (
          <div className="slot-buttons" aria-label="Quick desk positions">
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
        className="icon-button"
        aria-label="Close movement controls"
        onClick={onClose}
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
