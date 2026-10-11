"use client";
import { useMemo, useRef, useState } from "react";
import {
  useEditorStore,
  useWorkspaceStore,
} from "@/components/studio-provider";
import { createBlueprint } from "@/lib/blueprint";
import type { BlueprintViewId } from "@/types/blueprint";

export function useBlueprint() {
  const setup = useWorkspaceStore((state) => state.history.present);
  const loaded = useWorkspaceStore((state) => state.loaded);
  const storageWarning = useWorkspaceStore((state) => state.storageWarning);
  const moving = useEditorStore((state) => state.session !== null);
  const [viewId, setViewId] = useState<BlueprintViewId>("room");
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const exporting = useRef(false);
  const document = useMemo(() => createBlueprint(setup), [setup]);
  const view =
    document.views.find((candidate) => candidate.id === viewId) ??
    document.views[0];
  const select = (id: string) => {
    const item = document.items.find((candidate) => candidate.id === id);
    if (!item) return;
    setSelected(id);
    setViewId(item.view);
  };
  const exportPdf = async () => {
    if (!loaded || moving || exporting.current) return;
    exporting.current = true;
    setStatus("saving");
    // The document contains values only; it cannot change while the module loads.
    const snapshot = createBlueprint(setup, new Date().toISOString());
    try {
      const { downloadBlueprint } = await import("@/lib/blueprint-pdf");
      await downloadBlueprint(snapshot);
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      exporting.current = false;
    }
  };
  return {
    document,
    loaded,
    storageWarning,
    moving,
    view,
    selected,
    select,
    setViewId,
    status,
    exportPdf,
  };
}
