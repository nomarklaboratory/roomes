"use client";
import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";
import { RoomFallback } from "./room-fallback";
import type { Setup } from "@/lib/workspace";
import type { Point } from "@/lib/placement";
export type CameraView = "room" | "front" | "top" | "walk";
export type SceneProps = {
  setup: Setup;
  view: CameraView;
  onSelect: (id: string) => void;
  selected: string | null;
  editable: boolean;
  onMove: (id: string, position: Point) => void;
  onExitWalk: () => void;
};
const Scene = dynamic(() => import("./room-scene"), {
  ssr: false,
  loading: () => <div className="loading-panel">Opening your little room…</div>,
});
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export function RoomPreview(props: SceneProps) {
  return (
    <SceneBoundary fallback={<RoomFallback setup={props.setup} />}>
      <Scene {...props} />
    </SceneBoundary>
  );
}
