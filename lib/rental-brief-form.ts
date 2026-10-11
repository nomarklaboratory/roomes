import { defaultRentalBrief, workPreset } from "./rental-brief.ts";
import { normalizeRoom, validRoom } from "./room.ts";
import { rentalBriefSchema } from "./form-schemas.ts";
import type { Setup } from "../types/workspace.ts";
import type {
  BriefFieldError,
  RentalBrief,
  RentalBriefDraft,
  WorkStyle,
} from "../types/rental-brief.ts";

export function rentalBriefDraft(
  setup: Setup,
  brief: RentalBrief | null,
  returning: boolean,
): RentalBriefDraft {
  const values = brief ?? defaultRentalBrief();
  const workStyle =
    brief?.workStyle ??
    (returning
      ? ((Object.keys(workPreset) as WorkStyle[]).find(
          (style) => workPreset[style] === setup.presetId,
        ) ?? "everyday")
      : "everyday");
  return {
    area: values.area,
    date: values.date,
    weeks: setup.weeks,
    workStyle,
    screens: values.screens,
    laptopConnection: values.laptopConnection,
    budget:
      values.weeklyBudgetCents === null
        ? ""
        : String(values.weeklyBudgetCents / 100),
    measureRoom: values.room !== null,
    dimensions: {
      width: String(setup.room.width),
      depth: String(setup.room.depth),
      height: String(setup.room.height),
    },
  };
}

export function parseRentalBrief(draft: RentalBriefDraft) {
  const result = rentalBriefSchema.safeParse(draft);
  const errors: Partial<Record<BriefFieldError, string>> = {};
  if (!result.success)
    for (const issue of result.error.issues) {
      const field = issue.path.at(-1) as BriefFieldError;
      errors[field] ??= issue.message;
    }
  // Project incomplete drafts for the live suggestion without committing them.
  const dimensions = {
    width: Number(draft.dimensions.width),
    depth: Number(draft.dimensions.depth),
    height: Number(draft.dimensions.height),
  };
  const brief: RentalBrief = result.success
    ? result.data
    : {
        area: draft.area,
        date: draft.date,
        weeks: draft.weeks,
        workStyle: draft.workStyle,
        screens: draft.screens,
        weeklyBudgetCents:
          errors.budget || !draft.budget.trim()
            ? null
            : Math.round(Number(draft.budget) * 100),
        laptopConnection: draft.laptopConnection,
        room:
          draft.measureRoom && validRoom(dimensions)
            ? normalizeRoom(dimensions)
            : null,
      };
  return { brief, errors };
}
