"use client";

import { useCallback, useEffect, useRef, type HTMLAttributes } from "react";
import { newWalkInput, walkKey } from "@/lib/walk-input";
import type { CameraView, Posture } from "@/types/viewer";

const labels: Record<Posture, string> = {
  seated:
    "First-person workspace. Seated in your chair; drag to look, stand up to walk, Escape to exit.",
  standing:
    "First-person workspace. Drag to look, use WASD or arrow keys to walk, Escape to exit.",
};

export function useWalkInteraction(
  view: CameraView,
  posture: Posture,
  onExit: () => void,
) {
  const wrapper = useRef<HTMLDivElement>(null);
  const input = useRef(newWalkInput());
  const looking = useRef<{ pointer: number; x: number; y: number } | null>(
    null,
  );
  const walking = view === "walk";
  const setLocked = useCallback((locked: boolean) => {
    input.current.locked = locked;
    input.current.keys.clear();
    looking.current = null;
  }, []);

  useEffect(() => {
    if (walking) wrapper.current?.focus({ preventScroll: true });
    const stop = () => {
      input.current.keys.clear();
      looking.current = null;
    };
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      stop();
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [walking]);

  const keyboardEvents: HTMLAttributes<HTMLDivElement> = {
    tabIndex: walking ? 0 : -1,
    role: walking ? "region" : undefined,
    "aria-label": walking ? labels[posture] : undefined,
    onKeyDown: (event) => {
      if (!walking || input.current.locked || event.defaultPrevented) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onExit();
        return;
      }
      const direction = walkKey(event.key);
      if (!direction) return;
      event.preventDefault();
      if (posture === "standing") input.current.keys.add(direction);
    },
    onKeyUp: (event) => {
      if (!walking) return;
      const direction = walkKey(event.key);
      if (!direction) return;
      event.preventDefault();
      input.current.keys.delete(direction);
    },
    onBlur: (event) => {
      if (event.currentTarget.contains(event.relatedTarget)) return;
      input.current.keys.clear();
      looking.current = null;
    },
  };
  const lookEvents: HTMLAttributes<HTMLDivElement> = {
    onPointerDown: (event) => {
      if (
        !walking ||
        input.current.locked ||
        event.button !== 0 ||
        looking.current
      )
        return;
      wrapper.current?.focus({ preventScroll: true });
      looking.current = {
        pointer: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event) => {
      const look = looking.current;
      if (
        !walking ||
        input.current.locked ||
        !look ||
        look.pointer !== event.pointerId
      )
        return;
      input.current.look(event.clientX - look.x, event.clientY - look.y);
      look.x = event.clientX;
      look.y = event.clientY;
    },
    onPointerUp: (event) => {
      looking.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerCancel: () => {
      looking.current = null;
    },
    onLostPointerCapture: () => {
      looking.current = null;
    },
  };
  return { wrapper, input, walking, keyboardEvents, lookEvents, setLocked };
}
