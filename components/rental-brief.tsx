"use client";

import { useRentalBriefForm } from "@/hooks/use-rental-brief-form";
import { money } from "@/lib/catalog";
import type {
  RentalBrief as Brief,
  SetupRecommendation,
} from "@/types/rental-brief";
import { RentalBriefFields } from "./rental-brief-fields";
import { RentalRecommendation } from "./rental-recommendation";

export function RentalBrief({
  onApply,
  onSkip,
}: {
  onApply: (brief: Brief, recommendation: SetupRecommendation) => void;
  onSkip: () => void;
}) {
  const form = useRentalBriefForm(onApply);
  return (
    <form
      onSubmit={form.submit}
      noValidate
      aria-label="Your rental brief"
      className="grid items-start gap-6 pb-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8"
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dce2d2] bg-[#eef2e5] px-4 py-3 text-base lg:hidden"
        aria-live="polite"
      >
        <span>
          {money(form.recommendation.weeklyCents)} / week ·{" "}
          {money(form.recommendation.totalCents)} total
        </span>
        <a
          href="#recommendation-heading"
          className="inline-flex min-h-11 items-center font-medium text-[#40583a] underline underline-offset-4"
        >
          See suggestion
        </a>
      </div>
      <div>
        <RentalBriefFields form={form} />
        {Object.keys(form.errors).length > 0 && (
          <p role="alert" className="mt-4 text-base text-red-700">
            Check the highlighted answers before building your workspace.
          </p>
        )}
        <p className="mt-4 px-1 text-base leading-relaxed text-[#727c67]">
          Your answers stay in this tab and carry into checkout. Only the
          workspace and whether you finished this brief are saved on your
          device.
        </p>
      </div>
      <RentalRecommendation
        recommendation={form.recommendation}
        connection={form.draft.laptopConnection}
        hasMonitors={form.hasMonitors}
        returning={form.returning}
        onSkip={onSkip}
      />
    </form>
  );
}
