"use client";

import { useEffect, useMemo } from "react";
import { positionOf } from "@/lib/placement";
import { cameraLocked } from "@/lib/stores/editor-store";
import { useStudioStores } from "@/components/studio-provider";
import type { ProductMoveController } from "@/types/product-interaction";

export function useProductMove(
  editable: boolean,
  onLockChange: (locked: boolean) => void,
): ProductMoveController {
  const { editor, workspace } = useStudioStores();
  const movement = useMemo<ProductMoveController>(() => {
    const { hold, releaseHold, updateMove, cancelMove, beginMove } =
      editor.getState();
    return {
      getSession: () => editor.getState().session,
      isLocked: () => cameraLocked(editor.getState()),
      hold,
      releaseHold,
      begin: (id, anchor) => {
        if (!editable) return;
        const setup = workspace.getState().history.present;
        beginMove(id, positionOf(setup, id), anchor);
      },
      update: updateMove,
      cancel: cancelMove,
      confirm: () => {
        const move = editor.getState().session;
        if (!move) return;
        cancelMove();
        if (
          move.origin.x !== move.position.x ||
          move.origin.z !== move.position.z ||
          move.origin.y !== move.position.y
        )
          workspace
            .getState()
            .change({ type: "place", id: move.id, position: move.position });
      },
    };
  }, [editable, editor, workspace]);

  useEffect(() => {
    onLockChange(cameraLocked(editor.getState()));
    return editor.subscribe((state, previous) => {
      if (cameraLocked(state) !== cameraLocked(previous))
        onLockChange(cameraLocked(state));
    });
  }, [editor, onLockChange]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (!movement.getSession() || !["Escape", "Enter"].includes(event.key))
        return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape") movement.cancel();
      else movement.confirm();
    };
    const visibility = () => {
      if (document.hidden) movement.cancel();
    };
    window.addEventListener("keydown", key, true);
    window.addEventListener("blur", movement.cancel);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      movement.cancel();
      window.removeEventListener("keydown", key, true);
      window.removeEventListener("blur", movement.cancel);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [movement]);

  return movement;
}
