"use client";
import { useEffect, useState, type RefObject } from "react";
import { Icon } from "./icon";

export function PreviewTools({
  container,
  onZoom,
  expanded,
  onExpandedChange,
}: {
  container: RefObject<HTMLDivElement | null>;
  onZoom: (direction: number) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const [native, setNative] = useState(false);
  const fullscreen = native || expanded;
  useEffect(() => {
    const changed = () => {
      const active =
        document.fullscreenElement ===
        container.current?.closest(".preview-stage");
      setNative(active);
      if (active) onExpandedChange(true);
      else if (native) onExpandedChange(false);
    };
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, [container, native, onExpandedChange]);
  // iOS and embedded browsers may not allow element fullscreen. The same
  // preview can still expand to the viewport, with Escape and a visible exit.
  useEffect(() => {
    if (!expanded || native) return;
    const alreadyLocked = document.body.classList.contains("overflow-hidden");
    document.body.classList.add("overflow-hidden");
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onExpandedChange(false);
    };
    window.addEventListener("keydown", escape, true);
    return () => {
      if (!alreadyLocked) document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", escape, true);
    };
  }, [expanded, native, onExpandedChange]);
  const toggle = async () => {
    if (native) {
      await document.exitFullscreen();
      return;
    }
    if (expanded) {
      onExpandedChange(false);
      return;
    }
    const target = container.current?.closest<HTMLElement>(".preview-stage");
    if (!target) return;
    if (target.requestFullscreen) {
      try {
        await target.requestFullscreen();
        onExpandedChange(true);
        return;
      } catch {
        /* Use viewport expansion. */
      }
    }
    onExpandedChange(true);
  };
  return (
    <div
      className="absolute right-5 top-[62px] z-[3] flex flex-col gap-1 max-[700px]:right-[23px] max-[700px]:top-[58px]"
      aria-label="Preview controls"
    >
      <button
        className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#cfd9c1] bg-[#f7f7eeef] text-[#395334] hover:bg-[#e1e7d3] max-[700px]:h-11 max-[700px]:w-11"
        aria-label="Zoom in preview"
        title="Zoom in"
        onClick={() => onZoom(1)}
      >
        <Icon name="plus" size={17} />
      </button>
      <button
        className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#cfd9c1] bg-[#f7f7eeef] text-[#395334] hover:bg-[#e1e7d3] max-[700px]:h-11 max-[700px]:w-11"
        aria-label="Zoom out preview"
        title="Zoom out"
        onClick={() => onZoom(-1)}
      >
        <Icon name="minus" size={17} />
      </button>
      <button
        className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#cfd9c1] bg-[#f7f7eeef] text-[#395334] hover:bg-[#e1e7d3] max-[700px]:h-11 max-[700px]:w-11"
        aria-label={
          fullscreen ? "Exit fullscreen preview" : "Fullscreen preview"
        }
        title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        aria-pressed={fullscreen}
        onClick={toggle}
      >
        <Icon name={fullscreen ? "collapse" : "expand"} size={17} />
      </button>
    </div>
  );
}
