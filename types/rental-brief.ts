import type { BriefFormInput } from "./forms";
import type { Weeks } from "./catalog.ts";
import type { RoomDimensions } from "./placement.ts";
import type { Setup } from "./workspace.ts";

export type WorkStyle = "everyday" | "coding" | "creative";
export type ScreenPreference =
  "recommend" | "none" | "standard" | "wide" | "dual";
export type LaptopConnection = "unsure" | "usb-c" | "hdmi";
export type RentalBrief = {
  area: string;
  date: string;
  weeks: Weeks;
  workStyle: WorkStyle;
  screens: ScreenPreference;
  weeklyBudgetCents: number | null;
  laptopConnection: LaptopConnection;
  room: RoomDimensions | null;
};
export type SetupRecommendation = {
  setup: Setup;
  weeklyCents: number;
  totalCents: number;
  reasons: string[];
  budgetShortfallCents: number;
};
export type RentalBriefDraft = BriefFormInput;
export type BriefFieldError = "area" | "date" | "budget" | keyof RoomDimensions;
