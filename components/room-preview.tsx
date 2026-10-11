"use client";
import dynamic from "next/dynamic";
import { Component, memo, type ReactNode } from "react";
import { RoomFallback } from "./room-fallback";
import type { InspectableSceneProps } from "@/types/viewer";
const Scene = dynamic(() => import("./room-scene"), {
  ssr: false,
  loading: () => (
    <div className="loading-panel h-full flex items-center justify-center text-base text-[#6d7b5b]">
      Opening your little room…
    </div>
  ),
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
export const RoomPreview = memo(function RoomPreview(
  props: InspectableSceneProps,
) {
  return (
    <SceneBoundary fallback={<RoomFallback setup={props.setup} />}>
      <Scene {...props} />
    </SceneBoundary>
  );
});
