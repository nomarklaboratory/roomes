"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { PerspectiveCamera as ThreeCamera } from "three";
import { walkBlocked, walkStart, walkStep } from "@/lib/placement";
import { eyeHeight, seatedPosition, standUpPosition } from "@/lib/viewer";
import type { Setup } from "@/lib/workspace";
import type { Posture } from "@/types/viewer";
import type { WalkInput } from "@/lib/walk-input";

type WalkCameraOptions = {
  setup: Setup;
  input: RefObject<WalkInput>;
  posture: Posture;
};

function initialPosition(
  setup: Setup,
  posture: Posture,
  previousPosture: Posture | null,
) {
  if (posture === "seated") return seatedPosition(setup);
  if (previousPosture === "seated") return standUpPosition(setup);
  return walkStart(setup);
}

function useWalkInputCleanup(input: RefObject<WalkInput>) {
  useEffect(() => {
    const state = input.current;
    return () => state.keys.clear();
  }, [input]);
}

function useWalkPosition({ setup, input, posture }: WalkCameraOptions) {
  const position = useRef(walkStart(setup));
  const lastReset = useRef(-1);
  const lastPosture = useRef<Posture | null>(null);

  useFrame((_, deltaTime) => {
    const state = input.current;
    const resetChanged = lastReset.current !== state.reset;
    const postureChanged = lastPosture.current !== posture;

    if (resetChanged || postureChanged) {
      position.current = initialPosition(setup, posture, lastPosture.current);
      resetViewTowardDesk(
        setup,
        position.current,
        eyeHeight(setup, posture),
        state,
      );
      lastReset.current = state.reset;
      lastPosture.current = posture;
    }

    if (state.locked) return;

    position.current = nextPosition(
      setup,
      posture,
      position.current,
      state,
      deltaTime,
    );
  });

  return position;
}

function resetViewTowardDesk(
  setup: Setup,
  position: { x: number; z: number },
  height: number,
  state: WalkInput,
) {
  const dx = setup.layout.desk.x - position.x;
  const dz = setup.layout.desk.z - position.z;
  state.resetPose(
    Math.atan2(-dx, -dz),
    Math.atan2(1.02 - height, Math.hypot(dx, dz)),
  );
}

function nextPosition(
  setup: Setup,
  posture: Posture,
  position: { x: number; z: number },
  state: WalkInput,
  deltaTime: number,
) {
  if (posture === "seated") return seatedPosition(setup);

  const current = walkBlocked(setup, position) ? walkStart(setup) : position;
  const forward =
    Number(state.keys.has("forward")) - Number(state.keys.has("backward"));
  const side = Number(state.keys.has("right")) - Number(state.keys.has("left"));
  const directionLength = Math.hypot(forward, side) || 1;
  const speed = (Math.min(deltaTime, 0.05) * 1.1) / directionLength;

  return walkStep(setup, current, {
    x: (-Math.sin(state.yaw) * forward + Math.cos(state.yaw) * side) * speed,
    z: (-Math.cos(state.yaw) * forward - Math.sin(state.yaw) * side) * speed,
  });
}

function useWalkCameraTransform(
  camera: RefObject<ThreeCamera | null>,
  position: ReturnType<typeof useWalkPosition>,
  input: RefObject<WalkInput>,
  height: number,
) {
  useFrame(() => {
    const state = input.current;
    camera.current?.position.set(
      position.current.x,
      height,
      position.current.z,
    );
    camera.current?.rotation.set(state.pitch, state.yaw, 0, "YXZ");
  });
}

export function useFirstPersonCamera({
  setup,
  input,
  posture,
}: WalkCameraOptions) {
  const camera = useRef<ThreeCamera>(null);
  const position = useWalkPosition({ setup, input, posture });
  const height = eyeHeight(setup, posture);

  useWalkInputCleanup(input);
  useWalkCameraTransform(camera, position, input, height);

  return camera;
}
