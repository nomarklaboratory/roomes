"use client";
import Image from "next/image";
import { cn } from "@/lib/cn";
import {
  useInspectionImage,
  useInspectionVideo,
} from "@/hooks/use-inspection-media";
import type { ProductImage, ProductMedia, ProductVideo } from "@/types/catalog";
import { Icon } from "./icon";

function MediaFailure({
  source,
  retry,
}: {
  source: string;
  retry: () => void;
}) {
  return (
    <div
      role="status"
      className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl bg-stone-100 p-5 text-center text-base text-stone-600"
    >
      <p>This media couldn’t load.</p>
      <button
        type="button"
        className="rounded-lg border border-stone-300 bg-white px-4 py-2 hover:bg-stone-50"
        onClick={retry}
      >
        Try again
      </button>
      <a
        href={source}
        target="_blank"
        rel="noreferrer"
        className="text-base underline underline-offset-4"
      >
        Open original media
      </a>
    </div>
  );
}

function InspectionPhoto({ media }: { media: ProductImage }) {
  const {
    viewport: viewportRef,
    failed,
    retry,
    zoomed,
    attempt,
    fail,
    toggleZoom,
    panHandlers,
  } = useInspectionImage();
  if (failed) return <MediaFailure source={media.source} retry={retry} />;
  return (
    <div className="relative">
      <div
        ref={viewportRef}
        data-photo-viewport
        className={cn(
          "aspect-[4/3] overflow-auto rounded-xl border border-stone-200 bg-white",
          zoomed && "cursor-grab active:cursor-grabbing",
        )}
        {...panHandlers}
        tabIndex={zoomed ? 0 : -1}
        aria-label={
          zoomed
            ? "Zoomed photo. Drag, swipe or scroll to inspect details."
            : undefined
        }
      >
        <div
          className={cn(
            "relative h-full w-full",
            zoomed && "h-[200%] w-[200%]",
          )}
        >
          <Image
            key={attempt}
            src={media.src}
            alt={media.alt}
            fill
            sizes={
              zoomed
                ? "(min-width: 1152px) 1130px, (min-width: 768px) 100vw, 200vw"
                : "(min-width: 1152px) 565px, (min-width: 768px) 50vw, 100vw"
            }
            className="object-contain p-4 sm:p-6"
            onError={fail}
            draggable={false}
          />
        </div>
      </div>
      {zoomed && (
        <span className="pointer-events-none absolute left-3 top-3 rounded-lg bg-[#263b25]/90 px-3 py-2 text-base text-white shadow-sm">
          Drag or swipe to explore
        </span>
      )}
      <button
        type="button"
        aria-label={zoomed ? "Reset zoom" : "Zoom photo"}
        aria-pressed={zoomed}
        className={cn(
          "absolute flex items-end justify-end rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f583b]",
          zoomed
            ? "bottom-3 right-3 cursor-zoom-out!"
            : "inset-0 cursor-zoom-in! p-3",
        )}
        onClick={toggleZoom}
      >
        <span className="flex min-h-11 items-center gap-2 rounded-lg border border-stone-200 bg-white/95 px-3 py-2 text-base font-medium text-stone-700 shadow-sm hover:bg-stone-50">
          <Icon name={zoomed ? "zoomOut" : "zoomIn"} size={21} />
          {zoomed ? "Reset zoom" : "View details"}
        </span>
      </button>
    </div>
  );
}

function InspectionVideo({ media }: { media: ProductVideo }) {
  const {
    video: videoRef,
    failed,
    retry,
    started,
    start,
    fail,
  } = useInspectionVideo();
  if (failed) return <MediaFailure source={media.source} retry={retry} />;
  if (!started)
    return (
      <button
        type="button"
        onClick={start}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-900 text-white"
        aria-label="Play recorded film"
      >
        <Image
          src={media.poster}
          alt=""
          fill
          sizes="(min-width: 1152px) 565px, (min-width: 768px) 50vw, 100vw"
          className="object-contain opacity-60 group-hover:opacity-80"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-white px-5 py-3 text-base font-medium text-stone-800">
            ▶ Play recorded film
          </span>
        </span>
      </button>
    );
  return (
    <video
      ref={videoRef}
      src={media.src}
      poster={media.poster}
      controls
      autoPlay
      muted
      playsInline
      preload="metadata"
      aria-label={media.caption}
      onError={fail}
      className="aspect-[4/3] w-full rounded-xl bg-stone-900"
    />
  );
}

export function InspectionMedia({ media }: { media: ProductMedia }) {
  switch (media.kind) {
    case "image":
      return <InspectionPhoto media={media} />;
    case "video":
      return <InspectionVideo media={media} />;
  }
}
