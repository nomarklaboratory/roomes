import type { Setup } from "./workspace";

export type Posture = "standing" | "seated";
export type CameraView = "room" | "front" | "top" | "walk";
export type HoldCuePhase = "ready" | "charging" | "menu";
export type HoldCueAction = "move" | "inspect" | "delete" | "duplicate";
export type HoldCuePointer = {
  clientX: number;
  clientY: number;
  phase: HoldCuePhase;
  action?: HoldCueAction | null;
  canMove?: boolean;
  canDelete?: boolean;
  canDuplicate?: boolean;
};
export type SceneProps = {
  setup: Setup;
  view: CameraView;
  posture: Posture;
  onPostureChange: (posture: Posture) => void;
  onSit: () => void;
  onSelect: (id: string) => void;
  selected: string | null;
  editable: boolean;
  onRemove: (id: string) => void;
  onExitWalk: () => void;
  previewExpanded: boolean;
  onPreviewExpandedChange: (expanded: boolean) => void;
};

export type InspectableSceneProps = SceneProps & {
  onInspect: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onHoldCueChange: (cue: HoldCuePointer | null) => void;
};
