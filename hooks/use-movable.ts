"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { CameraControlsImpl } from "@react-three/drei";
import type { Group } from "three";
import {
  accessorySurfaceHeight,
  positionOf,
  productFor,
} from "@/lib/placement";
import {
  useEditorStore,
  useWorkspaceStore,
} from "@/components/studio-provider";
import { duplicatePlacement } from "@/lib/product-duplication";
import type { InspectableSceneProps, HoldCueAction } from "@/types/viewer";
import type {
  ProductMoveController,
  ProductPointer,
} from "@/types/product-interaction";
import { useLongPress } from "./use-long-press";

interface UseMovableOptions {
  id: string;
  setup: InspectableSceneProps["setup"];
  editable: boolean;
  onSelect: InspectableSceneProps["onSelect"];
  onInspect: InspectableSceneProps["onInspect"];
  onDeleteRequest: InspectableSceneProps["onDeleteRequest"];
  onHoldCueChange: InspectableSceneProps["onHoldCueChange"];
  movement: ProductMoveController;
}

export function useMovable({
  id,
  setup,
  editable,
  onSelect,
  onInspect,
  onDeleteRequest,
  onHoldCueChange,
  movement,
}: UseMovableOptions) {
  const get = useThree((state) => state.get);
  const gl = useThree((state) => state.gl);
  const group = useRef<Group>(null);
  const interaction = useRef<{
    pointer: number;
    release: () => void;
  } | null>(null);
  const { isLocked, hold, releaseHold, begin } = movement;
  const draft = useEditorStore((state) =>
    state.session?.id === id ? state.session.position : null,
  );
  const position = draft ?? positionOf(setup, id);
  const furniture = id === "desk" || id === "chair";
  const canDelete = editable && !furniture;
  const change = useWorkspaceStore((state) => state.change);
  const canDuplicate = useMemo(
    () => editable && duplicatePlacement(setup, id) !== null,
    [editable, setup, id],
  );
  const wall = productFor(setup, id)?.mount === "back-wall";
  const y = furniture ? 0 : accessorySurfaceHeight(setup, id, position);

  const releaseInteraction = useCallback(() => {
    const active = interaction.current;
    if (!active) return;
    interaction.current = null;
    releaseHold(id);
    active.release();
    gl.domElement.removeAttribute("data-product-hold");
    requestAnimationFrame(() => {
      const controls = get().controls;
      if (controls instanceof CameraControlsImpl)
        controls.enabled = !isLocked();
    });
  }, [get, gl, id, isLocked, releaseHold]);

  const chooseHoldAction = useCallback(
    (action: HoldCueAction | null, pointer?: ProductPointer) => {
      if (action === "move" && editable && pointer) {
        begin(id, pointer);
        onSelect(id);
      }
      releaseInteraction();
      if (action === "inspect") onInspect(id);
      if (action === "delete" && canDelete) onDeleteRequest(id);
      if (action === "duplicate" && canDuplicate)
        change({ type: "duplicate", id, newId: crypto.randomUUID() });
    },
    [
      begin,
      canDelete,
      editable,
      id,
      onDeleteRequest,
      onInspect,
      onSelect,
      releaseInteraction,
      change,
      canDuplicate,
    ],
  );
  const { start: startHold, cancel: cancelHold } = useLongPress(
    chooseHoldAction,
    onHoldCueChange,
    editable,
    canDelete,
    canDuplicate,
  );

  useEffect(() => releaseInteraction, [releaseInteraction]);

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (event.button !== 0 || !event.isPrimary || isLocked()) return;
    event.nativeEvent.stopImmediatePropagation();
    event.nativeEvent.preventDefault();
    hold(id);
    const controls = get().controls;
    if (controls instanceof CameraControlsImpl) controls.enabled = false;
    const target = event.target as Element;
    target.setPointerCapture(event.pointerId);
    interaction.current = {
      pointer: event.pointerId,
      release: () => {
        try {
          target.releasePointerCapture(event.pointerId);
        } catch {
          // Cancellation can release native capture before this handler runs.
        }
      },
    };
    gl.domElement.setAttribute("data-product-hold", id);
    startHold(event);
  };
  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (interaction.current?.pointer === event.pointerId)
      event.stopPropagation();
  };
  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (interaction.current?.pointer === event.pointerId) cancelHold();
  };
  const onPointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (isLocked()) return;
    gl.domElement.style.setProperty("cursor", "pointer");
    onHoldCueChange({
      clientX: event.clientX,
      clientY: event.clientY,
      phase: "ready",
    });
  };
  const onPointerOut = () => {
    if (isLocked()) return;
    gl.domElement.style.removeProperty("cursor");
    onHoldCueChange(null);
  };

  return {
    group,
    position,
    y,
    furniture,
    wall,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerOver,
    onPointerOut,
  };
}
