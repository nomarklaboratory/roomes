import Image from "next/image";
import { cn } from "@/lib/cn";
import { inspectionMediaLabel } from "@/lib/product-inspection";
import type { ProductMedia } from "@/types/catalog";
import { InspectionMedia } from "./inspection-media";

function MediaThumbnail({
  media,
  active,
  onSelect,
}: {
  media: ProductMedia;
  active: boolean;
  onSelect: () => void;
}) {
  const src = media.kind === "video" ? media.poster : media.src;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`View ${media.caption}`}
      aria-pressed={active}
      className={cn(
        "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-white transition-colors",
        active
          ? "border-[#3f583b] ring-2 ring-[#3f583b]/25"
          : "border-stone-200 hover:border-stone-400",
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="80px"
        className="object-contain p-1"
      />
      {media.kind === "video" && (
        <span className="absolute inset-x-0 bottom-0 bg-stone-800/80 text-base text-white">
          ▶ Film
        </span>
      )}
    </button>
  );
}

export function InspectionGallery({
  active,
  media,
  context,
  selectMedia,
}: {
  active?: ProductMedia;
  media: readonly ProductMedia[];
  context: string;
  selectMedia: (id: string) => void;
}) {
  return (
    <div className="min-w-0">
      {active && (
        <InspectionMedia key={`${context}:${active.id}`} media={active} />
      )}
      {!active && (
        <p className="rounded-xl bg-stone-100 p-5 text-base text-stone-600">
          Product media is unavailable for this finish.
        </p>
      )}
      <div
        className="mt-3 flex gap-3 overflow-x-auto p-1"
        aria-label="Product media"
      >
        {media.map((item) => (
          <MediaThumbnail
            key={item.id}
            media={item}
            active={item.id === active?.id}
            onSelect={() => selectMedia(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function InspectionMediaDetails({ media }: { media?: ProductMedia }) {
  if (!media) return null;
  return (
    <div className="space-y-1 text-base leading-relaxed md:col-start-1">
      <p className="font-medium text-stone-700">{media.caption}</p>
      <p className="text-stone-600">
        {inspectionMediaLabel(media)} · {media.variant}
      </p>
      <a
        className="inline-flex min-h-11 items-center text-[#3f583b] underline underline-offset-4"
        href={media.source}
        target="_blank"
        rel="noreferrer"
      >
        View original media ↗
      </a>
    </div>
  );
}
