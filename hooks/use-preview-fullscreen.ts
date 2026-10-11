"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

type UsePreviewFullscreenOptions = {
  container: RefObject<HTMLDivElement | null>;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

export function usePreviewFullscreen({
  container,
  expanded,
  onExpandedChange,
}: UsePreviewFullscreenOptions) {
  const [native, setNative] = useState(false);

  useEffect(() => {
    const changed = () => {
      const active =
        document.fullscreenElement ===
        container.current?.closest("[data-preview-stage]");
      setNative(active);
      if (active) onExpandedChange(true);
      else if (native) onExpandedChange(false);
    };
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, [container, native, onExpandedChange]);

  useEffect(() => {
    if (!expanded || native) return;
    const alreadyLocked = document.body.classList.contains("overflow-hidden");
    document.body.classList.add("overflow-hidden");
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (
        container.current
          ?.closest("[data-preview-stage]")
          ?.querySelector(
            "[data-product-inspector], [data-product-delete-dialog], [data-product-catalog], [data-move-mode], [data-product-wheel]",
          )
      )
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onExpandedChange(false);
    };
    window.addEventListener("keydown", escape, true);
    return () => {
      if (!alreadyLocked) document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", escape, true);
    };
  }, [container, expanded, native, onExpandedChange]);

  const toggle = useCallback(async () => {
    if (native) {
      await document.exitFullscreen();
      return;
    }
    if (expanded) {
      onExpandedChange(false);
      return;
    }
    const target = container.current?.closest<HTMLElement>(
      "[data-preview-stage]",
    );
    if (!target) return;
    if (target.requestFullscreen) {
      try {
        await target.requestFullscreen();
        onExpandedChange(true);
        return;
      } catch {
        // Fall back to a viewport-sized preview.
      }
    }
    onExpandedChange(true);
  }, [container, expanded, native, onExpandedChange]);

  return { fullscreen: native || expanded, toggle };
}
