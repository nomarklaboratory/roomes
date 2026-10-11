import { createStore } from "zustand/vanilla";
import { defaultRentalBrief } from "../rental-brief.ts";
import type { RentalBrief } from "../../types/rental-brief.ts";
import type { StudioStep } from "../../types/studio.ts";

export const ONBOARDING_KEY = "roomes.onboarding.v1";
export type RentalBriefState = {
  status: "loading" | "pending" | "complete";
  step: StudioStep;
  brief: RentalBrief | null;
  storageWarning: boolean;
  open: () => void;
  commit: (brief: RentalBrief) => void;
  skip: () => void;
  updateDelivery: (field: "area" | "date", value: string) => void;
  clear: () => void;
};
export function createRentalBriefStore() {
  return createStore<RentalBriefState>()((set) => ({
    status: "loading",
    step: "brief",
    brief: null,
    storageWarning: false,
    open: () => set({ step: "brief" }),
    commit: (brief) => set({ brief, step: "design", status: "complete" }),
    skip: () => set({ step: "design", status: "complete" }),
    updateDelivery: (field, value) =>
      set((state) => ({
        brief: { ...(state.brief ?? defaultRentalBrief()), [field]: value },
      })),
    clear: () => set({ brief: null }),
  }));
}
type BriefStore = ReturnType<typeof createRentalBriefStore>;
type BriefStorage = Pick<Storage, "getItem" | "setItem">;

// A saved workspace is not evidence of completed onboarding. Only this marker
// controls the first-visit flow; all rental answers remain in memory.
export function connectRentalBriefStorage(
  store: BriefStore,
  storage: () => BriefStorage,
) {
  if (store.getState().status === "loading") {
    let status: "pending" | "complete" = "pending";
    let storageWarning = false;
    try {
      const raw = storage().getItem(ONBOARDING_KEY);
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          if (
            saved.version === 1 &&
            ["pending", "complete"].includes(saved.status)
          )
            status = saved.status;
        } catch {
          /* A malformed marker starts a fresh, skippable brief. */
        }
      }
    } catch {
      storageWarning = true;
    }
    store.setState({
      status,
      step: status === "complete" ? "design" : "brief",
      storageWarning,
    });
  }
  const save = () => {
    try {
      storage().setItem(
        ONBOARDING_KEY,
        JSON.stringify({ version: 1, status: store.getState().status }),
      );
    } catch {
      if (!store.getState().storageWarning)
        store.setState({ storageWarning: true });
    }
  };
  const disconnect = store.subscribe((state, previous) => {
    if (state.status !== previous.status && state.status !== "loading") save();
  });
  save();
  return disconnect;
}
