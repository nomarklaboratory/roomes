"use client";
import { useEffect, useRef, type RefObject } from "react";

export function useInspectionFocus(
  open: boolean,
  close: () => void,
  trigger: RefObject<HTMLButtonElement | null>,
) {
  const panel = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    const returnFocus = trigger.current;
    const dialog = panel.current;
    if (!dialog) return;
    const alreadyLocked = document.body.classList.contains("overflow-hidden");
    document.body.classList.add("overflow-hidden");
    dialog.showModal();
    const frame = requestAnimationFrame(() =>
      dialog.focus({ preventScroll: true }),
    );
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !dialog.open) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
    };
    window.addEventListener("keydown", escape, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", escape, true);
      dialog.close();
      if (!alreadyLocked) document.body.classList.remove("overflow-hidden");
      returnFocus?.focus({ preventScroll: true });
    };
  }, [open, close, trigger]);
  return panel;
}
