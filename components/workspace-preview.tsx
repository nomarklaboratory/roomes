"use client";
import { memo, useCallback, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { presets } from "@/lib/catalog";
import { roomLabel } from "@/lib/room";
import { useProductInspection } from "@/hooks/use-product-inspection";
import { useProductRemoval } from "@/hooks/use-product-removal";
import type { HoldCuePointer } from "@/types/viewer";
import { useEditorStore, useWorkspaceStore } from "./studio-provider";
import { RoomPreview } from "./room-preview";
import { ProductInspector } from "./product-inspector";
import { Icon } from "./icon";
import { ProductHoldCue } from "./product-hold-cue";
import { DeleteProductDialog } from "./delete-product-dialog";
import { CatalogDialog } from "./catalog-dialog";

export const WorkspacePreview = memo(function WorkspacePreview({
  editable,
}: {
  editable: boolean;
}) {
  const setup = useWorkspaceStore((state) => state.history.present);
  const change = useWorkspaceStore((state) => state.change);
  const view = useEditorStore((state) => state.view);
  const posture = useEditorStore((state) => state.posture);
  const selected = useEditorStore((state) => state.selected);
  const moving = useEditorStore((state) => state.session !== null);
  const previewExpanded = useEditorStore((state) => state.previewExpanded);
  const onViewChange = useEditorStore((state) => state.setView);
  const onPostureChange = useEditorStore((state) => state.setPosture);
  const onSit = useEditorStore((state) => state.sitInChair);
  const selectItem = useEditorStore((state) => state.select);
  const onPreviewExpandedChange = useEditorStore(
    (state) => state.setPreviewExpanded,
  );
  const setCatalogOpen = useEditorStore((state) => state.setCatalogOpen);
  const onOpenCatalog = useCallback(
    () => setCatalogOpen(true),
    [setCatalogOpen],
  );
  const onExitWalk = useCallback(() => onViewChange("room"), [onViewChange]);
  const onRemove = useCallback(
    (id: string) => change({ type: "remove", id }),
    [change],
  );
  const scene = {
    setup,
    view,
    posture,
    selected,
    previewExpanded,
    editable,
    onPostureChange,
    onSit,
    onPreviewExpandedChange,
    onExitWalk,
    onRemove,
  };
  const inspection = useProductInspection(scene.setup, scene.selected);
  const { isOpen: inspectionOpen, inspect } = inspection;
  const removal = useProductRemoval(scene.setup, scene.onRemove);
  const stage = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const stageRef = useCallback((node: HTMLDivElement | null) => {
    stage.current = node;
    setPortalContainer(node);
  }, []);
  const trigger = useRef<HTMLButtonElement>(null);
  const catalogTrigger = useRef<HTMLButtonElement>(null);
  const [holdCue, setHoldCue] = useState<{
    x: number;
    y: number;
    phase: HoldCuePointer["phase"];
    action?: HoldCuePointer["action"];
    canMove?: boolean;
    canDelete?: boolean;
    canDuplicate?: boolean;
  } | null>(null);
  const updateHoldCue = useCallback((cue: HoldCuePointer | null) => {
    if (!cue) {
      setHoldCue(null);
      return;
    }
    const bounds = stage.current?.getBoundingClientRect();
    if (!bounds) return;
    setHoldCue({
      x: cue.clientX - bounds.left,
      y: cue.clientY - bounds.top,
      phase: cue.phase,
      action: cue.action,
      canMove: cue.canMove,
      canDelete: cue.canDelete,
      canDuplicate: cue.canDuplicate,
    });
  }, []);
  const name = presets.find(
    (preset) => preset.id === scene.setup.presetId,
  )?.name;
  const select = useCallback(
    (id: string) => {
      if (editable) selectItem(id);
      if (inspectionOpen) inspect(id);
    },
    [editable, selectItem, inspectionOpen, inspect],
  );
  return (
    <div
      ref={stageRef}
      data-preview-stage
      className={cn(
        "@container relative isolate flex h-[min(72dvh,760px)] min-h-[520px] w-full flex-col overflow-hidden rounded-2xl border border-[#dce1d2] bg-[#f0f2e8] max-[700px]:h-[min(68dvh,640px)] max-[700px]:min-h-[420px]",
        scene.previewExpanded &&
          "fixed inset-0 z-[100] h-dvh w-screen max-w-none rounded-none border-0",
      )}
    >
      <div className="z-10 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#dce1d2] bg-[#f7f7ef]/95 px-3 py-3">
        <span className="text-base text-stone-600">
          {[name, roomLabel(scene.setup.room)].filter(Boolean).join(" · ")}
        </span>
        <div
          className="flex flex-wrap items-center gap-1"
          aria-label="Camera angle"
        >
          {(["room", "front", "top"] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => onViewChange(view)}
              aria-pressed={scene.view === view}
              className={cn(
                "rounded-lg px-3 py-2 text-base text-stone-600 hover:bg-[#e5e9dc]",
                scene.view === view && "bg-[#e0e7d4] text-[#3f583b]",
              )}
            >
              {view[0].toUpperCase() + view.slice(1)}
            </button>
          ))}
          <button
            type="button"
            aria-label="First-person view"
            aria-pressed={scene.view === "walk"}
            onClick={() => onViewChange("walk")}
            className={cn(
              "flex items-center gap-1 rounded-lg px-3 py-2 text-base text-[#3f583b] hover:bg-[#e5e9dc]",
              scene.view === "walk" && "bg-[#e0e7d4]",
            )}
          >
            <Icon name="eye" size={13} /> Inside
          </button>
          {moving ? (
            <button
              type="button"
              disabled
              title="Place or cancel the moving item first"
              className="min-h-11 rounded-lg border border-[#cbd4bf] px-3 text-base text-[#3f583b]"
            >
              Blueprint
            </button>
          ) : (
            <Link
              href="/blueprint"
              className="inline-flex min-h-11 items-center rounded-lg border border-[#cbd4bf] px-3 text-base font-medium text-[#3f583b] hover:bg-[#edf2e7]"
            >
              Blueprint
            </Link>
          )}
          <button
            ref={trigger}
            type="button"
            onClick={inspection.open}
            aria-expanded={inspection.isOpen}
            aria-haspopup="dialog"
            className="ml-1 rounded-lg border border-[#a5b595] bg-white px-3 py-2 text-base font-medium text-[#3f583b] hover:bg-[#edf2e7]"
          >
            Inspect product
          </button>
          {scene.editable && (
            <button
              ref={catalogTrigger}
              type="button"
              onClick={onOpenCatalog}
              aria-haspopup="dialog"
              aria-label={`Open product catalog. ${scene.setup.items.length + 2} items in your setup`}
              title="Open product catalog"
              className="relative ml-1 flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#a5b595] bg-[#344c32] text-white shadow-sm transition hover:bg-[#263b25] active:scale-95"
            >
              <Icon name="cart" size={21} />
              <span
                aria-hidden="true"
                className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full border-2 border-[#f7f7ef] bg-[#d9efad] text-base font-semibold leading-none text-[#263b25]"
              >
                {scene.setup.items.length + 2}
              </span>
            </button>
          )}
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1">
        <div className="relative min-h-0 min-w-0 flex-1" data-scene-container>
          <RoomPreview
            {...scene}
            onSelect={select}
            onInspect={inspection.inspect}
            onDeleteRequest={removal.request}
            onHoldCueChange={updateHoldCue}
          />
        </div>
        <ProductInspector inspection={inspection} trigger={trigger} />
      </div>
      {scene.editable && (
        <CatalogDialog
          container={scene.previewExpanded ? portalContainer : null}
          onReturnToPreview={() =>
            catalogTrigger.current?.focus({ preventScroll: true })
          }
        />
      )}
      <DeleteProductDialog
        product={removal.product}
        container={portalContainer}
        onCancel={removal.cancel}
        onConfirm={removal.confirm}
        onReturnToPreview={() =>
          stage.current
            ?.querySelector<HTMLElement>(".room-interaction")
            ?.focus({ preventScroll: true })
        }
      />
      {holdCue && !inspection.isOpen && !removal.product && (
        <ProductHoldCue
          x={holdCue.x}
          y={holdCue.y}
          phase={holdCue.phase}
          action={holdCue.action}
          canMove={holdCue.canMove ?? false}
          canDelete={holdCue.canDelete ?? false}
          canDuplicate={holdCue.canDuplicate ?? false}
        />
      )}
      {scene.view !== "walk" && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[#dce1d2] px-3 py-2 text-base text-stone-600">
          <span>Hold a product and slide to choose an action.</span>
        </div>
      )}
    </div>
  );
});
