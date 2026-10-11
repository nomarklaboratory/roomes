"use client";

import { useEffect, useRef, type ComponentRef } from "react";
import type { CameraControls } from "@react-three/drei";
import { roomCameraScale } from "@/lib/room";
import type { RoomDimensions } from "@/types/placement";
import type { CameraView } from "@/types/viewer";

const positions: Record<CameraView, readonly [number, number, number]> = {
  room: [4.5, 3.4, 5.3],
  front: [0, 2.1, 5.7],
  top: [0.01, 6, 0.01],
  walk: [4.5, 3.4, 5.3],
};

export function useOverviewCamera(
  view: CameraView,
  zoomSteps: number,
  room: RoomDimensions,
) {
  const scale = roomCameraScale(room);
  const controls = useRef<ComponentRef<typeof CameraControls>>(null);
  const lastZoom = useRef(zoomSteps);
  useEffect(() => {
    const delta = zoomSteps - lastZoom.current;
    lastZoom.current = zoomSteps;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (delta) void controls.current?.dolly(delta * 0.7, !reduced);
  }, [zoomSteps]);
  useEffect(() => {
    let lastFactor = 0;
    const update = (event?: Event) => {
      const factor =
        (window.matchMedia("(max-width: 700px)").matches ? 1.2 : 1) * scale;
      if (event && factor === lastFactor) return;
      lastFactor = factor;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const [x, y, z] = positions[view];
      void controls.current?.setLookAt(
        x * factor,
        y * factor,
        z * factor,
        0,
        0.9 * scale,
        0,
        !reduced,
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [view, scale]);
  return controls;
}
