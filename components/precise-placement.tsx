"use client";
import { placementLabels, placementView } from "@/lib/blueprint";
import { usePrecisePlacement } from "@/hooks/use-precise-placement";
import type { Action, Setup } from "@/types/workspace";
import { FieldError } from "./ui/field-error";

export function PrecisePlacement({
  setup,
  id,
  disabled,
  onChange,
}: {
  setup: Setup;
  id: string;
  disabled: boolean;
  onChange: (action: Action) => void;
}) {
  const {
    register,
    apply,
    formState: { errors },
  } = usePrecisePlacement(setup, id, onChange);
  const labels = placementLabels[placementView(setup, id)];
  return (
    <form
      noValidate
      onSubmit={apply}
      aria-label="Precise product position"
      className="mt-3 rounded-xl border border-[#d8dfcb] bg-white p-4"
    >
      <h3 className="text-base font-medium text-[#3f583b]">
        Position by measurement
      </h3>
      <p
        id="position-help"
        className="mt-1 text-base leading-relaxed text-stone-600"
      >
        {labels.help}
      </p>
      <fieldset
        disabled={disabled}
        className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start"
      >
        {(["left", "offset"] as const).map((field) => (
          <div key={field}>
            <label
              htmlFor={`position-${field}`}
              className="text-base text-stone-700"
            >
              {labels[field]}
            </label>
            <input
              id={`position-${field}`}
              type="number"
              inputMode="decimal"
              step="0.1"
              {...register(field)}
              aria-invalid={!!errors[field]}
              aria-describedby={
                errors[field] ? `position-${field}-error` : "position-help"
              }
              className="mt-2 min-h-11 w-full rounded-lg border border-[#cbd4bf] px-3 text-base aria-invalid:border-red-600"
            />
            <FieldError
              id={`position-${field}-error`}
              message={errors[field]?.message}
            />
          </div>
        ))}
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-[#3f583b] px-4 text-base font-medium text-white sm:mt-8"
        >
          Apply position
        </button>
      </fieldset>
      {disabled && (
        <p role="status" className="mt-3 text-base text-[#3f583b]">
          Place or cancel the moving item before entering measurements.
        </p>
      )}
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="mt-3 text-base text-red-700">
          Check the highlighted distances.
        </p>
      )}
    </form>
  );
}
