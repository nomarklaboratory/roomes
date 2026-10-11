import { createStore } from "zustand/vanilla";
import {
  decodeSaved,
  initialHistory,
  reducer,
  STORAGE_KEY,
  STORAGE_VERSION,
} from "../workspace.ts";
import type { Action, History } from "../../types/workspace.ts";

export type WorkspaceState = {
  history: History;
  loaded: boolean;
  storageWarning: boolean;
  change: (action: Action) => void;
};

export function createWorkspaceStore() {
  return createStore<WorkspaceState>()((set) => ({
    history: initialHistory(),
    loaded: false,
    storageWarning: false,
    change: (action) =>
      set((state) => {
        const history = reducer(state.history, action);
        return history === state.history ? state : { history };
      }),
  }));
}

export type WorkspaceStore = ReturnType<typeof createWorkspaceStore>;
type WorkspaceStorage = Pick<Storage, "getItem" | "setItem">;

// Keep the existing envelope and decoder so v1/v2/v3 workspaces survive the
// migration. Browser storage is connected only after the client mounts.
export function connectWorkspaceStorage(
  store: WorkspaceStore,
  storage: () => WorkspaceStorage,
) {
  if (!store.getState().loaded) {
    let history = store.getState().history;
    let storageWarning = false;
    try {
      const saved = decodeSaved(storage().getItem(STORAGE_KEY));
      if (saved) history = reducer(history, { type: "hydrate", setup: saved });
    } catch {
      storageWarning = true;
    }
    store.setState({ history, loaded: true, storageWarning });
  }

  const save = () => {
    try {
      storage().setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: STORAGE_VERSION,
          setup: store.getState().history.present,
        }),
      );
    } catch {
      if (!store.getState().storageWarning)
        store.setState({ storageWarning: true });
    }
  };
  const unsubscribe = store.subscribe((state, previous) => {
    if (state.loaded && state.history.present !== previous.history.present)
      save();
  });
  save();
  return unsubscribe;
}
