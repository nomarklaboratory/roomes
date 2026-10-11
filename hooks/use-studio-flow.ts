"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useEditorStore,
  useRentalBriefStore,
  useWorkspaceStore,
} from "@/components/studio-provider";
import type { RentalBrief, SetupRecommendation } from "@/types/rental-brief";

export function useStudioFlow() {
  const step = useRentalBriefStore((state) => state.step);
  const ready = useRentalBriefStore((state) => state.status !== "loading");
  const returning = useRentalBriefStore((state) => state.status === "complete");
  const loaded = useWorkspaceStore((state) => state.loaded);
  const open = useRentalBriefStore((state) => state.open);
  const commit = useRentalBriefStore((state) => state.commit);
  const skip = useRentalBriefStore((state) => state.skip);
  const change = useWorkspaceStore((state) => state.change);
  const setSelected = useEditorStore((state) => state.setSelected);
  const setCatalogOpen = useEditorStore((state) => state.setCatalogOpen);
  const setView = useEditorStore((state) => state.setView);
  const setExpanded = useEditorStore((state) => state.setPreviewExpanded);
  const [help, setHelp] = useState(false);
  const helpRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (help) helpRef.current?.showModal();
    else helpRef.current?.close();
  }, [help]);
  const focusHeading = useCallback(() => {
    requestAnimationFrame(() => {
      headingRef.current?.focus();
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });
  }, []);
  const openBrief = useCallback(() => {
    setSelected(null);
    setCatalogOpen(false);
    setView("room");
    setExpanded(false);
    open();
    focusHeading();
  }, [focusHeading, open, setCatalogOpen, setExpanded, setSelected, setView]);
  const applyBrief = useCallback(
    (brief: RentalBrief, recommendation: SetupRecommendation) => {
      change({ type: "apply-brief", setup: recommendation.setup });
      commit(brief);
      focusHeading();
    },
    [change, commit, focusHeading],
  );
  const skipBrief = useCallback(() => {
    skip();
    focusHeading();
  }, [focusHeading, skip]);
  return {
    step,
    returning,
    ready: ready && loaded,
    openBrief,
    applyBrief,
    skipBrief,
    headingRef,
    setHelp,
    helpRef,
  };
}
