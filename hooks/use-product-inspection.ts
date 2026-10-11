"use client";
import { useCallback, useState } from "react";
import { inspectionMedia, inspectionTargets } from "@/lib/product-inspection";
import type { Setup } from "@/types/workspace";

export function useProductInspection(setup: Setup, selected: string | null) {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [selection, setSelection] = useState<{
    context: string;
    mediaId: string;
  } | null>(null);
  const targets = inspectionTargets(setup);
  // Resolve against the current setup: replacing a product or removing an item
  // never leaves stale product media visible. Inspector state is not persisted.
  const target = targets.find((item) => item.id === targetId) ?? targets[0];
  const finish = target.id === "desk" ? setup.finish : undefined;
  const media = inspectionMedia(target.product, finish);
  const context = `${target.id}:${target.product.id}:${finish ?? ""}`;
  const active =
    media.find(
      (item) => selection?.context === context && item.id === selection.mediaId,
    ) ?? media[0];
  const close = useCallback(() => setTargetId(null), []);
  const inspect = useCallback((id: string) => setTargetId(id), []);
  const open = () =>
    inspect(targets.find((item) => item.id === selected)?.id ?? "desk");
  const selectMedia = (mediaId: string) => setSelection({ context, mediaId });
  return {
    isOpen: targetId !== null,
    target,
    targets,
    finish,
    media,
    active,
    context,
    open,
    inspect,
    close,
    selectMedia,
  };
}
