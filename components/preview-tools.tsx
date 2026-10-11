"use client";
import type { RefObject } from "react";
import { usePreviewFullscreen } from "@/hooks/use-preview-fullscreen";
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
  const { fullscreen, toggle } = usePreviewFullscreen({
    container,
    expanded,
    onExpandedChange,
  });
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
