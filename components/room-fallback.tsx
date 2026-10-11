import { catalog, finishes } from "@/lib/catalog";
import { type Setup } from "@/lib/workspace";
import { RoomFallbackIllustration } from "./room-fallback-illustration";
export function RoomFallback({
  setup,
  loading = false,
}: {
  setup: Setup;
  loading?: boolean;
}) {
  const finish = finishes.find((f) => f.id === setup.finish)!.color;
  return (
    <div
      className="room-fallback flex flex-col justify-center items-center h-full [&_svg]:w-full [&_svg]:max-h-[90%] [&_span]:text-[#7a836c] [&_span]:text-base"
      role="img"
      aria-label={`${catalog[setup.deskId].name}, ${catalog[setup.chairId].name}, and ${setup.items.length} accessories in your workspace`}
    >
      <RoomFallbackIllustration setup={setup} finish={finish} />
      <span>
        {loading
          ? "Setting the scene…"
          : "2D preview · 3D is unavailable on this device"}
      </span>
    </div>
  );
}
