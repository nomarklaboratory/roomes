"use client";
import type { RefObject } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { eyeHeight, person } from "@/lib/viewer";
import { catalog } from "@/lib/catalog";
import type { Setup } from "@/lib/workspace";
import type { Posture } from "@/types/viewer";
import { useFirstPersonCamera } from "@/hooks/use-first-person-camera";
import type { WalkInput } from "@/lib/walk-input";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export { newWalkInput, WalkInput, walkKey } from "@/lib/walk-input";

export function FirstPersonCamera({
  setup,
  input,
  posture,
  fov,
}: {
  setup: Setup;
  input: RefObject<WalkInput>;
  posture: Posture;
  fov: number;
}) {
  const camera = useFirstPersonCamera({ setup, input, posture });
  return <PerspectiveCamera ref={camera} makeDefault fov={fov} near={0.05} />;
}
const directions = [
  {
    id: "forward",
    icon: "up",
    label: "Walk forward",
    className: "col-start-2",
  },
  {
    id: "left",
    icon: "back",
    label: "Walk left",
    className: "col-start-1 row-start-2",
  },
  {
    id: "backward",
    icon: "down",
    label: "Walk backward",
    className: "col-start-2 row-start-2",
  },
  {
    id: "right",
    icon: "arrow",
    label: "Walk right",
    className: "col-start-3 row-start-2",
  },
] as const;
export function WalkControls({
  input,
  onExit,
  setup,
  posture,
  onPostureChange,
}: {
  input: RefObject<WalkInput>;
  onExit: () => void;
  setup: Setup;
  posture: Posture;
  onPostureChange: (posture: Posture) => void;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="walk-caption absolute left-5 top-6 rounded-xl border border-white/50 bg-[#f6f6edeb] px-3 py-2 text-[#354a30] max-[700px]:left-4">
        <span className="flex items-center gap-2 text-base font-semibold">
          <Icon name="eye" size={16} /> Inside your space
        </span>
        <span className="mt-1.5 block text-base">
          {Math.round(person.height * 100)} cm person ·{" "}
          {posture === "standing" ? "Standing" : "Seated"} eyes{" "}
          {Math.round(eyeHeight(setup, posture) * 100)} cm
        </span>
        <small className="mt-1 block text-base text-[#647457]">
          {posture === "seated"
            ? `In ${catalog[setup.chairId].name} · Drag to look`
            : "Drag to look · WASD / arrows to walk"}
        </small>
        <small className="mt-1 block text-base text-[#647457]">
          Hold a product and slide to choose an action
        </small>
      </div>
      <div className="absolute bottom-5 left-5 flex gap-2 pointer-events-auto max-[700px]:left-4 max-[700px]:bottom-4 max-[700px]:flex-col">
        <button
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#c1d999] bg-[#d9efad] px-3 text-base text-[#395334]"
          onClick={() =>
            onPostureChange(posture === "standing" ? "seated" : "standing")
          }
        >
          <Icon name="chair" size={15} />{" "}
          {posture === "standing" ? "Sit in chair" : "Stand up"}
        </button>
        <button
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#cfd9c1] bg-[#f7f7eeef] px-3 text-base text-[#395334]"
          onClick={() => input.current.recenter()}
        >
          <Icon name="reset" size={15} /> Recenter
        </button>
        <button
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#344c32] bg-[#344c32] px-3 text-base text-white"
          onClick={onExit}
        >
          <Icon name="back" size={15} /> Exit view
        </button>
      </div>
      {posture === "standing" && (
        <div
          className="absolute bottom-5 right-5 grid grid-cols-[repeat(3,2.75rem)] grid-rows-[repeat(2,2.75rem)] gap-1 pointer-events-auto max-[700px]:right-4 max-[700px]:bottom-4"
          aria-label="Walk through your workspace"
        >
          {directions.map(({ id, icon, label, className }) => (
            <button
              key={id}
              className={cn(
                "flex items-center justify-center rounded-lg border border-[#cfd9c1] bg-[#f7f7eeef] text-[#395334] select-none touch-none active:bg-[#c6e790]",
                className,
              )}
              aria-label={label}
              onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                input.current.keys.add(id);
              }}
              onPointerUp={() => input.current.keys.delete(id)}
              onPointerCancel={() => input.current.keys.delete(id)}
              onLostPointerCapture={() => input.current.keys.delete(id)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  input.current.keys.add(id);
                }
              }}
              onKeyUp={(e) => {
                if (e.key === " " || e.key === "Enter")
                  input.current.keys.delete(id);
              }}
              onBlur={() => input.current.keys.delete(id)}
            >
              <Icon name={icon} size={18} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
