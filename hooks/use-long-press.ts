"use client";

import { useCallback, useEffect, useRef } from "react";
import type { HoldCueAction, HoldCuePointer } from "@/types/viewer";
import type { ProductPointer } from "@/types/product-interaction";
import { productHoldAction } from "@/lib/product-actions";

const HOLD_DURATION = 420;
const MOVEMENT_TOLERANCE = 12;

export function useLongPress(
  onChoose: (action: HoldCueAction | null, pointer?: ProductPointer) => void,
  onCueChange: (cue: HoldCuePointer | null) => void,
  canMove: boolean,
  canDelete: boolean,
  canDuplicate: boolean,
) {
  const action = useRef(onChoose);
  const cueAction = useRef(onCueChange);
  const canMoveRef = useRef(canMove);
  const canDeleteRef = useRef(canDelete);
  const canDuplicateRef = useRef(canDuplicate);
  const pending = useRef<{
    pointerId: number;
    x: number;
    y: number;
    phase: "charging" | "menu" | "cancelled";
    action: HoldCueAction | null;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);

  useEffect(() => {
    action.current = onChoose;
  }, [onChoose]);
  useEffect(() => {
    cueAction.current = onCueChange;
  }, [onCueChange]);
  useEffect(() => {
    canMoveRef.current = canMove;
  }, [canMove]);
  useEffect(() => {
    canDeleteRef.current = canDelete;
  }, [canDelete]);
  useEffect(() => {
    canDuplicateRef.current = canDuplicate;
  }, [canDuplicate]);

  const cancel = useCallback(() => {
    if (!pending.current) return;
    clearTimeout(pending.current.timer);
    pending.current = null;
    cueAction.current(null);
    action.current(null);
  }, []);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const press = pending.current;
      if (!press || event.pointerId !== press.pointerId) return;
      if (press.phase === "charging") {
        if (
          Math.hypot(event.clientX - press.x, event.clientY - press.y) >
          MOVEMENT_TOLERANCE
        ) {
          clearTimeout(press.timer);
          press.phase = "cancelled";
          cueAction.current(null);
        }
        return;
      }
      if (press.phase === "cancelled") return;
      press.action = productHoldAction(
        event.clientX - press.x,
        event.clientY - press.y,
        canMoveRef.current,
        canDeleteRef.current,
        canDuplicateRef.current,
      );
      cueAction.current({
        clientX: press.x,
        clientY: press.y,
        phase: "menu",
        action: press.action,
        canMove: canMoveRef.current,
        canDelete: canDeleteRef.current,
        canDuplicate: canDuplicateRef.current,
      });
    };
    const release = (event: PointerEvent) => {
      const press = pending.current;
      if (event.pointerId !== press?.pointerId) return;
      clearTimeout(press.timer);
      pending.current = null;
      cueAction.current(null);
      action.current(press.phase === "menu" ? press.action : null, {
        clientX: event.clientX,
        clientY: event.clientY,
        pointerType: event.pointerType,
      });
    };
    const anotherPointer = (event: PointerEvent) => {
      if (pending.current && event.pointerId !== pending.current.pointerId)
        cancel();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !pending.current) return;
      event.preventDefault();
      event.stopPropagation();
      cancel();
    };
    const visibility = () => {
      if (document.hidden) cancel();
    };
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", release, true);
    window.addEventListener("pointercancel", cancel, true);
    window.addEventListener("lostpointercapture", cancel, true);
    window.addEventListener("pointerdown", anotherPointer, true);
    window.addEventListener("blur", cancel);
    window.addEventListener("keydown", escape, true);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancel();
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", release, true);
      window.removeEventListener("pointercancel", cancel, true);
      window.removeEventListener("lostpointercapture", cancel, true);
      window.removeEventListener("pointerdown", anotherPointer, true);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", escape, true);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [cancel]);

  const start = (
    event: Pick<
      PointerEvent,
      "button" | "isPrimary" | "pointerId" | "clientX" | "clientY"
    >,
  ) => {
    if (event.button !== 0 || !event.isPrimary) return;
    cancel();
    pending.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      phase: "charging",
      action: null,
      timer: setTimeout(() => {
        const press = pending.current;
        if (!press || press.pointerId !== event.pointerId) return;
        press.phase = "menu";
        cueAction.current({
          clientX: press.x,
          clientY: press.y,
          phase: "menu",
          action: null,
          canMove: canMoveRef.current,
          canDelete: canDeleteRef.current,
          canDuplicate: canDuplicateRef.current,
        });
      }, HOLD_DURATION),
    };
    cueAction.current({
      clientX: event.clientX,
      clientY: event.clientY,
      phase: "charging",
      canMove,
      canDelete,
      canDuplicate,
    });
  };

  const isMenuOpen = () => pending.current?.phase === "menu";
  const getAction = () => pending.current?.action ?? null;

  return { start, cancel, isMenuOpen, getAction };
}
