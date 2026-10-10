import type { Point } from "@/lib/placement";
import type { Setup } from "@/lib/workspace";

export type Posture = "standing" | "seated";
export type CameraView = "room" | "front" | "top" | "walk";
export type SceneProps = {
  setup: Setup;
  view: CameraView;
  posture: Posture;
  onPostureChange: (posture: Posture) => void;
  onSit: () => void;
  onSelect: (id: string) => void;
  selected: string | null;
  editable: boolean;
  onMove: (id: string, position: Point) => void;
  onExitWalk: () => void;
  previewExpanded: boolean;
  onPreviewExpandedChange: (expanded: boolean) => void;
};
