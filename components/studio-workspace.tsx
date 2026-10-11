"use client";
import { memo } from "react";
import { catalog, type AccessoryKind } from "@/lib/catalog";
import { inspectionTargets } from "@/lib/product-inspection";
import { useEditorStore, useWorkspaceStore } from "./studio-provider";
import { WorkspacePreview } from "./workspace-preview";
import { RoomDimensions } from "./room-dimensions";
import { Icon } from "./icon";
import { PlacementControls } from "./placement-controls";

const accessoryIconNames: Record<AccessoryKind, "monitor" | "leaf" | "extras"> =
  {
    monitor: "monitor",
    plant: "leaf",
    lamp: "extras",
    stand: "extras",
    surfboard: "extras",
    "desk-mat": "extras",
    "mouse-pad": "extras",
    keyboard: "extras",
    mouse: "extras",
    controller: "extras",
  };

function AccessoryIcon({ productId }: { productId: string }) {
  const kind = catalog[productId].kind ?? "stand";
  return <Icon name={accessoryIconNames[kind]} size={14} />;
}

export const StudioWorkspace = memo(function StudioWorkspace({
  editable,
}: {
  editable: boolean;
}) {
  const setup = useWorkspaceStore((state) => state.history.present);
  const change = useWorkspaceStore((state) => state.change);
  const selected = useEditorStore((state) => state.selected);
  const view = useEditorStore((state) => state.view);
  const select = useEditorStore((state) => state.select);
  const setSelected = useEditorStore((state) => state.setSelected);
  const sitInChair = useEditorStore((state) => state.sitInChair);
  return (
    <section
      className="visual-column min-w-0 max-[700px]:w-full"
      aria-label="Your workspace"
    >
      {editable && <RoomDimensions room={setup.room} onChange={change} />}
      <WorkspacePreview editable={editable} />
      {editable && (
        <div className="setup-strip flex gap-3 items-center pt-3 min-h-[3.3125rem] max-[700px]:items-start max-[700px]:gap-[0.5625rem]">
          <span className="strip-label text-base text-[#526346] whitespace-nowrap">
            Your setup
          </span>
          <div className="item-chips flex flex-wrap gap-[0.3125rem] [&_button]:flex [&_button]:items-center [&_button]:gap-[0.3125rem] [&_button]:border [&_button]:border-[#e0e4d7] [&_button]:bg-[#f2f3eb] [&_button]:py-[0.3125rem] [&_button]:px-[0.5625rem] [&_button]:rounded-[0.375rem] [&_button]:text-base [&_button]:min-h-[2.0625rem] [&_button]:text-[#647258] [&_button[aria-pressed='true']]:border-[#8b9e6d] [&_button[aria-pressed='true']]:bg-[#e8eedc] max-[700px]:gap-1 max-[700px]:[&_button]:min-h-10 max-[700px]:[&_button]:text-base max-[700px]:[&_button]:py-1 max-[700px]:[&_button]:px-[0.4375rem]">
            <button
              aria-pressed={selected === "desk"}
              onClick={() => {
                select("desk", true);
              }}
            >
              <Icon name="desk" size={14} />
              Desk
            </button>
            <button
              aria-pressed={selected === "chair"}
              onClick={() => {
                select("chair", true);
              }}
            >
              <Icon name="chair" size={14} />
              Chair
            </button>
            {inspectionTargets(setup)
              .slice(2)
              .map((item) => (
                <button
                  key={item.id}
                  aria-pressed={selected === item.id}
                  onClick={() => {
                    select(item.id, true);
                  }}
                >
                  <AccessoryIcon productId={item.product.id} /> {item.label}
                </button>
              ))}
          </div>
        </div>
      )}
      {editable && selected && view !== "walk" && (
        <PlacementControls
          setup={setup}
          selected={selected}
          onChange={change}
          onClose={() => setSelected(null)}
          onSit={sitInChair}
        />
      )}
    </section>
  );
});
