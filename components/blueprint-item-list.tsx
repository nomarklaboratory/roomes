import { cn } from "@/lib/cn";
import { measurementText } from "@/lib/blueprint";
import type { BlueprintItem } from "@/types/blueprint";

const references = { room: "Room", desk: "Desk", wall: "Back wall" };
export function BlueprintItemList({
  items,
  selected,
  onSelect,
}: {
  items: BlueprintItem[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ol className="space-y-3" aria-label="Blueprint products">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            aria-pressed={selected === item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "w-full rounded-2xl border border-[#dce3d4] bg-white p-4 text-left text-base transition hover:border-[#728962]",
              selected === item.id && "border-[#728962] bg-[#edf3e5]",
            )}
          >
            <span className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e7eddf] font-semibold text-[#3f583b]">
                {item.number}
              </span>
              <span>
                <span className="block font-medium text-[#2c3e29]">
                  {item.name}
                </span>
                <span className="mt-1 block text-stone-600">
                  {references[item.view]} · {item.brand}
                </span>
              </span>
            </span>
            <span className="mt-3 block text-stone-600">
              {item.width} × {item.depth} × {item.height} cm · W × D × H
            </span>
            <span className="mt-3 grid gap-1 text-[#3f583b]">
              <span>
                {item.view === "desk" ? "Left desk edge" : "Left wall edge"}:{" "}
                {measurementText(item.left)}
              </span>
              <span>
                {item.view === "wall" ? "Bottom from floor" : "Back edge"}:{" "}
                {measurementText(item.offset)}
              </span>
              {item.view === "desk" && (
                <span>
                  Surface height: {measurementText(item.surfaceHeight)}
                </span>
              )}
            </span>
            {item.estimated && (
              <span className="mt-3 block text-stone-600">
                Estimated footprint; check your product before placing.
              </span>
            )}
          </button>
        </li>
      ))}
    </ol>
  );
}
