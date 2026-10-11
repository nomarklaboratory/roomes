"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { placementMeasurements, pointFromMeasurements } from "@/lib/blueprint";
import { placementSchema } from "@/lib/placement-form";
import type { Action, Setup } from "@/types/workspace";
import type { PlacementInput, PlacementMeasurements } from "@/types/blueprint";

export function usePrecisePlacement(
  setup: Setup,
  id: string,
  onChange: (action: Action) => void,
) {
  const values = placementMeasurements(setup, id);
  const form = useForm<PlacementInput, unknown, PlacementMeasurements>({
    defaultValues: { left: String(values.left), offset: String(values.offset) },
    resolver: zodResolver(placementSchema(setup, id)),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  return {
    ...form,
    apply: form.handleSubmit((measurements) => {
      onChange({
        type: "place",
        id,
        position: pointFromMeasurements(setup, id, measurements),
      });
    }),
  };
}
