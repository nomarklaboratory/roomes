"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import {
  connectRentalBriefStorage,
  createRentalBriefStore,
  type RentalBriefState,
} from "@/lib/stores/rental-brief-store";
import { createEditorStore, type EditorState } from "@/lib/stores/editor-store";
import {
  connectWorkspaceStorage,
  createWorkspaceStore,
  type WorkspaceState,
} from "@/lib/stores/workspace-store";

function createStudioStores() {
  return {
    workspace: createWorkspaceStore(),
    editor: createEditorStore(),
    rentalBrief: createRentalBriefStore(),
  };
}
const StudioStoresContext = createContext<ReturnType<
  typeof createStudioStores
> | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [stores] = useState(createStudioStores);
  useEffect(() => {
    let active = true;
    let disconnectStorage: (() => void) | undefined;
    let disconnectBrief: (() => void) | undefined;
    const disconnectEditor = stores.workspace.subscribe((state, previous) => {
      if (state.history.present === previous.history.present) return;
      const editor = stores.editor.getState();
      editor.cancelMove();
      if (
        editor.selected &&
        !["desk", "chair"].includes(editor.selected) &&
        !state.history.present.items.some((item) => item.id === editor.selected)
      )
        editor.setSelected(null);
    });
    queueMicrotask(() => {
      if (active) {
        disconnectBrief = connectRentalBriefStorage(
          stores.rentalBrief,
          () => window.localStorage,
        );
        disconnectStorage = connectWorkspaceStorage(
          stores.workspace,
          () => window.localStorage,
        );
      }
    });
    return () => {
      active = false;
      disconnectStorage?.();
      disconnectBrief?.();
      disconnectEditor();
    };
  }, [stores]);
  return (
    <StudioStoresContext.Provider value={stores}>
      {children}
    </StudioStoresContext.Provider>
  );
}

export function useStudioStores() {
  const stores = useContext(StudioStoresContext);
  if (!stores) throw new Error("Studio stores require StudioProvider.");
  return stores;
}

export function useWorkspaceStore<T>(selector: (state: WorkspaceState) => T) {
  return useStore(useStudioStores().workspace, selector);
}

export function useEditorStore<T>(selector: (state: EditorState) => T) {
  return useStore(useStudioStores().editor, selector);
}

export function useRentalBriefStore<T>(
  selector: (state: RentalBriefState) => T,
) {
  return useStore(useStudioStores().rentalBrief, selector);
}
