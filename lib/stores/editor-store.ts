import { createStore } from "zustand/vanilla";
import type { Category } from "../../types/catalog.ts";
import type { Point } from "../../types/placement.ts";
import type { CameraView, Posture } from "../../types/viewer.ts";
import type {
  ProductMoveSession,
  ProductPointer,
} from "../../types/product-interaction.ts";

export type EditorState = {
  category: Category;
  view: CameraView;
  posture: Posture;
  selected: string | null;
  previewExpanded: boolean;
  catalogOpen: boolean;
  session: ProductMoveSession | null;
  holdingId: string | null;
  setCategory: (category: Category) => void;
  setSelected: (selected: string | null) => void;
  select: (id: string, toggle?: boolean) => void;
  setView: (view: CameraView) => void;
  setPosture: (posture: Posture) => void;
  sitInChair: () => void;
  setPreviewExpanded: (expanded: boolean) => void;
  setCatalogOpen: (open: boolean) => void;
  hold: (id: string) => void;
  releaseHold: (id: string) => void;
  beginMove: (id: string, origin: Point, anchor: ProductPointer) => void;
  updateMove: (position: Point) => void;
  cancelMove: () => void;
};

export const cameraLocked = (state: EditorState) =>
  state.session !== null || state.holdingId !== null;

export function createEditorStore() {
  return createStore<EditorState>()((set) => ({
    category: "desk",
    view: "room",
    posture: "standing",
    selected: null,
    previewExpanded: false,
    catalogOpen: false,
    session: null,
    holdingId: null,
    setCategory: (category) =>
      set({ category, selected: null, session: null, holdingId: null }),
    setSelected: (selected) =>
      set((state) => ({
        selected,
        ...(state.session?.id !== selected
          ? { session: null, holdingId: null }
          : {}),
      })),
    select: (id, toggle = false) =>
      set((state) => ({
        category: id === "desk" || id === "chair" ? id : "accessory",
        selected: toggle && state.selected === id ? null : id,
        ...(state.session && state.session.id !== id
          ? { session: null, holdingId: null }
          : {}),
      })),
    setView: (view) =>
      set({
        view,
        session: null,
        holdingId: null,
        ...(view === "walk" ? { posture: "standing", selected: null } : {}),
      }),
    setPosture: (posture) => set({ posture, session: null, holdingId: null }),
    sitInChair: () =>
      set({
        posture: "seated",
        view: "walk",
        selected: null,
        session: null,
        holdingId: null,
      }),
    setPreviewExpanded: (previewExpanded) => set({ previewExpanded }),
    setCatalogOpen: (catalogOpen) =>
      set({
        catalogOpen,
        ...(catalogOpen ? { session: null, holdingId: null } : {}),
      }),
    hold: (holdingId) => set({ holdingId }),
    releaseHold: (id) =>
      set((state) => (state.holdingId === id ? { holdingId: null } : state)),
    beginMove: (id, origin, anchor) =>
      set({ session: { id, origin, position: origin, anchor } }),
    updateMove: (position) =>
      set((state) => {
        const session = state.session;
        if (
          !session ||
          (session.position.x === position.x &&
            session.position.z === position.z &&
            session.position.y === position.y)
        )
          return state;
        return { session: { ...session, position } };
      }),
    cancelMove: () =>
      set((state) =>
        state.session || state.holdingId
          ? { session: null, holdingId: null }
          : state,
      ),
  }));
}

export type EditorStore = ReturnType<typeof createEditorStore>;
