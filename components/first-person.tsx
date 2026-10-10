"use client";
import { useEffect, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import type { PerspectiveCamera as ThreeCamera } from "three";
import { walkBlocked, walkStart, walkStep } from "@/lib/placement";
import type { Setup } from "@/lib/workspace";
import { Icon } from "./icon";

// An imperative input controller keeps high-frequency look/walk events out of
// React state. It belongs to the scene and is never part of saved setup data.
export class WalkInput {
  keys = new Set<string>();
  yaw = 0;
  pitch = 0;
  reset = 0;
  recenter() {
    this.reset++;
  }
  resetPose(yaw: number) {
    this.yaw = yaw;
    this.pitch = -0.24;
  }
  look(x: number, y: number) {
    this.yaw -= x * 0.005;
    this.pitch = Math.max(-1.1, Math.min(1.1, this.pitch - y * 0.004));
  }
}
export const newWalkInput = () => new WalkInput();
export function FirstPersonCamera({
  setup,
  input,
}: {
  setup: Setup;
  input: RefObject<WalkInput>;
}) {
  const camera = useRef<ThreeCamera>(null);
  const position = useRef(walkStart(setup));
  const lastReset = useRef(-1);
  useEffect(() => {
    const state = input.current;
    return () => {
      state.keys.clear();
    };
  }, [input]);
  useFrame((_, dt) => {
    const state = input.current;
    if (lastReset.current !== state.reset) {
      position.current = walkStart(setup);
      const dx = setup.layout.desk.x - position.current.x;
      const dz = setup.layout.desk.z - position.current.z;
      state.resetPose(Math.atan2(-dx, -dz));
      lastReset.current = state.reset;
    }
    if (walkBlocked(setup, position.current))
      position.current = walkStart(setup);
    const forward =
      Number(state.keys.has("forward")) - Number(state.keys.has("backward"));
    const side =
      Number(state.keys.has("right")) - Number(state.keys.has("left"));
    const length = Math.hypot(forward, side) || 1;
    const speed = (Math.min(dt, 0.05) * 1.1) / length;
    position.current = walkStep(setup, position.current, {
      x: (-Math.sin(state.yaw) * forward + Math.cos(state.yaw) * side) * speed,
      z: (-Math.cos(state.yaw) * forward - Math.sin(state.yaw) * side) * speed,
    });
    // Also recover safely if furniture is changed while the visitor is inside.
    camera.current?.position.set(position.current.x, 1.55, position.current.z);
    camera.current?.rotation.set(state.pitch, state.yaw, 0, "YXZ");
  });
  return <PerspectiveCamera ref={camera} makeDefault fov={65} near={0.05} />;
}
const directions = [
  { id: "forward", icon: "up", label: "Walk forward" },
  { id: "left", icon: "back", label: "Walk left" },
  { id: "backward", icon: "down", label: "Walk backward" },
  { id: "right", icon: "arrow", label: "Walk right" },
] as const;
export function WalkControls({
  input,
  onExit,
}: {
  input: RefObject<WalkInput>;
  onExit: () => void;
}) {
  return (
    <div className="walk-hud">
      <div className="walk-caption">
        <span>
          <Icon name="eye" size={16} /> Inside your space
        </span>
        <small>Drag to look · WASD / arrows to walk</small>
      </div>
      <div className="walk-actions">
        <button className="walk-reset" onClick={() => input.current.recenter()}>
          <Icon name="reset" size={15} /> Recenter
        </button>
        <button className="walk-exit" onClick={onExit}>
          <Icon name="back" size={15} /> Exit view
        </button>
      </div>
      <div className="walk-pad" aria-label="Walk through your workspace">
        {directions.map(({ id, icon, label }) => (
          <button
            key={id}
            className={`walk-${id}`}
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
    </div>
  );
}
const keyDirections: Record<string, string> = {
  w: "forward",
  ArrowUp: "forward",
  s: "backward",
  ArrowDown: "backward",
  a: "left",
  ArrowLeft: "left",
  d: "right",
  ArrowRight: "right",
};
export const walkKey = (key: string) =>
  keyDirections[key.length === 1 ? key.toLowerCase() : key];
