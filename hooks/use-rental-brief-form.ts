"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useRentalBriefStore,
  useWorkspaceStore,
} from "@/components/studio-provider";
import { nextDeliveryDate } from "@/lib/checkout";
import { catalog } from "@/lib/catalog";
import { parseRentalBrief, rentalBriefDraft } from "@/lib/rental-brief-form";
import { rentalBriefSchema } from "@/lib/form-schemas";
import { recommendSetup } from "@/lib/rental-brief";
import type { BriefFormInput, BriefFormOutput } from "@/types/forms";
import type { RentalBrief, SetupRecommendation } from "@/types/rental-brief";

export function useRentalBriefForm(
  onApply: (brief: RentalBrief, recommendation: SetupRecommendation) => void,
) {
  const setup = useWorkspaceStore((state) => state.history.present);
  const committed = useRentalBriefStore((state) => state.brief);
  const returning = useRentalBriefStore((state) => state.status === "complete");
  const [defaults] = useState(() =>
    rentalBriefDraft(setup, committed, returning),
  );
  const form = useForm<BriefFormInput, unknown, BriefFormOutput>({
    resolver: zodResolver(rentalBriefSchema),
    defaultValues: defaults,
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });
  const watched = useWatch({ control: form.control });
  const draft = useMemo(
    () => ({
      ...defaults,
      ...watched,
      dimensions: { ...defaults.dimensions, ...watched.dimensions },
    }),
    [defaults, watched],
  );
  const parsed = useMemo(() => parseRentalBrief(draft), [draft]);
  const recommendation = useMemo(
    () => recommendSetup(parsed.brief, setup.room),
    [parsed.brief, setup.room],
  );
  const hasMonitors = recommendation.setup.items.some(
    (item) => catalog[item.productId].kind === "monitor",
  );
  const [minimumDate, setMinimumDate] = useState("");
  useEffect(() => {
    queueMicrotask(() => setMinimumDate(nextDeliveryDate()));
  }, []);
  const fieldErrors = form.formState.errors;
  const errors = {
    ...(fieldErrors.area && { area: fieldErrors.area.message }),
    ...(fieldErrors.date && { date: fieldErrors.date.message }),
    ...(fieldErrors.budget && { budget: fieldErrors.budget.message }),
    ...(fieldErrors.dimensions?.width && {
      width: fieldErrors.dimensions.width.message,
    }),
    ...(fieldErrors.dimensions?.depth && {
      depth: fieldErrors.dimensions.depth.message,
    }),
    ...(fieldErrors.dimensions?.height && {
      height: fieldErrors.dimensions.height.message,
    }),
  };
  return {
    draft,
    errors,
    register: form.register,
    minimumDate,
    recommendation,
    hasMonitors,
    returning,
    update: (field: "measureRoom", value: boolean) =>
      form.setValue(field, value, {
        shouldDirty: true,
        shouldValidate: form.formState.isSubmitted,
      }),
    submit: form.handleSubmit(
      (brief) => onApply(brief, recommendSetup(brief, setup.room)),
      () => setMinimumDate(nextDeliveryDate()),
    ),
  };
}
