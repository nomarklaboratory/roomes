import type { HoldCueAction } from "@/types/viewer";
import { cn } from "@/lib/cn";

const sectors = [
  { action: "move", start: 135, end: 225, color: "#657b55", active: "#d5edab" },
  {
    action: "duplicate",
    start: 225,
    end: 315,
    color: "#587a83",
    active: "#bddfe6",
  },
  {
    action: "inspect",
    start: 315,
    end: 405,
    color: "#958759",
    active: "#eadba5",
  },
  {
    action: "delete",
    start: 45,
    end: 135,
    color: "#916565",
    active: "#f1b8ad",
  },
] as const;

function polar(radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return [140 + Math.cos(radians) * radius, 140 + Math.sin(radians) * radius];
}

function sectorPath(start: number, end: number) {
  const outerStart = polar(124, start + 1);
  const outerEnd = polar(124, end - 1);
  const innerEnd = polar(72, end - 1);
  const innerStart = polar(72, start + 1);
  return `M${outerStart} A124 124 0 0 1 ${outerEnd} L${innerEnd} A72 72 0 0 0 ${innerStart} Z`;
}

export function ProductActionWheelArt({
  selected,
  canMove,
  canDelete,
  canDuplicate,
}: {
  selected?: HoldCueAction | null;
  canMove: boolean;
  canDelete: boolean;
  canDuplicate: boolean;
}) {
  return (
    <svg
      viewBox="0 0 280 280"
      className="size-full overflow-visible drop-shadow-xl"
      aria-hidden="true"
    >
      <circle cx="140" cy="140" r="127" fill="#202822" fillOpacity="0.95" />
      {sectors.map((sector) => {
        const active = selected === sector.action;
        const enabled =
          sector.action === "inspect" ||
          (sector.action === "duplicate"
            ? canDuplicate
            : sector.action === "move"
              ? canMove
              : canDelete);
        const angle = (((sector.start + sector.end) / 2) * Math.PI) / 180;
        return (
          <g
            key={sector.action}
            style={{
              transform: active
                ? `translate(${Math.cos(angle) * 6}px, ${Math.sin(angle) * 6}px)`
                : "translate(0px, 0px)",
            }}
            className="transition-transform duration-100 ease-out motion-reduce:transition-none"
          >
            <path
              d={sectorPath(sector.start, sector.end)}
              fill={active ? sector.active : sector.color}
              stroke={active ? "#fff7df" : "#27312a"}
              strokeWidth={active ? 3 : 1.5}
              className={cn(
                "transition-[fill,stroke] duration-100",
                !enabled && "opacity-25",
              )}
            />
          </g>
        );
      })}
      <circle
        cx="140"
        cy="140"
        r="68"
        fill="#202822"
        stroke="#a5b595"
        strokeOpacity="0.2"
        strokeWidth="2"
      />
    </svg>
  );
}
