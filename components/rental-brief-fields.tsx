import { durations } from "@/lib/catalog";
import {
  baliAreas,
  connectionLabels,
  screenChoices,
  workStyles,
} from "@/lib/rental-brief";
import { roomLimits } from "@/lib/room";
import type { useRentalBriefForm } from "@/hooks/use-rental-brief-form";
import type { BriefFieldError, LaptopConnection } from "@/types/rental-brief";
import { Icon } from "./icon";

const fieldClass =
  "mt-2 min-h-13 w-full min-w-0 rounded-xl border border-[#d9dfd2] bg-[#fdfdf9] px-3 py-3 text-base focus:border-[#60784e] aria-invalid:border-red-600";
type Form = ReturnType<typeof useRentalBriefForm>;
function FieldError({
  field,
  errors,
}: {
  field: BriefFieldError;
  errors: Form["errors"];
}) {
  return errors[field] ? (
    <p id={`brief-${field}-error`} className="mt-2 text-base text-red-700">
      {errors[field]}
    </p>
  ) : null;
}

export function RentalBriefFields({ form }: { form: Form }) {
  const { draft, update, register, errors, minimumDate, hasMonitors } = form;
  return (
    <div className="space-y-8 rounded-3xl border border-[#e1e4da] bg-white p-5 sm:p-8">
      <fieldset>
        <legend className="mb-2 flex items-center gap-3 text-2xl font-medium tracking-tight">
          <Icon name="pin" /> Your Bali stay
        </legend>
        <p className="mb-6 text-base leading-relaxed text-[#727c67]">
          Still figuring things out? Leave your area or date open.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="brief-area" className="text-base font-medium">
              Where in Bali will you work?
            </label>
            <select
              id="brief-area"
              {...register("area")}
              className={fieldClass}
              aria-invalid={!!errors.area}
              aria-describedby={errors.area ? "brief-area-error" : undefined}
            >
              <option value="">Not sure yet</option>
              {baliAreas.map((area) => (
                <option key={area}>{area}</option>
              ))}
            </select>
            <FieldError field="area" errors={errors} />
          </div>
          <div>
            <label htmlFor="brief-date" className="text-base font-medium">
              When do you need your setup?{" "}
              <span className="font-normal text-[#727c67]">(optional)</span>
            </label>
            <input
              id="brief-date"
              type="date"
              min={minimumDate}
              {...register("date")}
              className={fieldClass}
              aria-invalid={!!errors.date}
              aria-describedby={
                errors.date ? "brief-date-error" : "brief-date-help"
              }
            />
            <p id="brief-date-help" className="mt-2 text-base text-[#727c67]">
              Preferred delivery date, subject to confirmation.
            </p>
            <FieldError field="date" errors={errors} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="brief-weeks" className="text-base font-medium">
              How long do you need it?
            </label>
            <select
              id="brief-weeks"
              {...register("weeks", { valueAsNumber: true })}
              className={fieldClass}
            >
              {durations.map((weeks) => (
                <option key={weeks} value={weeks}>
                  {weeks} {weeks === 1 ? "week" : "weeks"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>
      <fieldset className="border-t border-[#edf0e7] pt-7">
        <legend className="float-left mb-6 flex w-full items-center gap-3 text-2xl font-medium tracking-tight">
          <Icon name="desk" /> Make work feel good
        </legend>
        <fieldset className="clear-both">
          <legend className="mb-3 text-base font-medium">
            What will you mainly do?
          </legend>
          <div className="grid gap-3">
            {workStyles.map((style) => (
              <label key={style.value} className="relative cursor-pointer">
                <input
                  type="radio"
                  value={style.value}
                  {...register("workStyle")}
                  className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
                <span className="flex min-h-18 items-center justify-between gap-3 rounded-xl border border-[#dce1d4] bg-[#fdfdf9] px-4 py-3 peer-checked:border-[#637d4d] peer-checked:bg-[#eef2e5] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#607c3e]">
                  <span>
                    <span className="block text-base font-medium">
                      {style.label}
                    </span>
                    <span className="mt-1 block text-base text-[#727c67]">
                      {style.description}
                    </span>
                  </span>
                  {draft.workStyle === style.value && (
                    <Icon name="check" size={18} />
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-6">
          <label htmlFor="brief-screens" className="text-base font-medium">
            How much screen space do you need?
          </label>
          <select
            id="brief-screens"
            {...register("screens")}
            className={fieldClass}
          >
            {screenChoices.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        </div>
        {hasMonitors && (
          <div className="mt-6">
            <label htmlFor="brief-connection" className="text-base font-medium">
              How will your laptop connect?
            </label>
            <select
              id="brief-connection"
              {...register("laptopConnection")}
              className={fieldClass}
              aria-describedby="brief-connection-help"
            >
              {(Object.keys(connectionLabels) as LaptopConnection[]).map(
                (connection) => (
                  <option key={connection} value={connection}>
                    {connectionLabels[connection]}
                  </option>
                ),
              )}
            </select>
            <p
              id="brief-connection-help"
              className="mt-2 text-base leading-relaxed text-[#727c67]"
            >
              USB-C does not always carry video. We’ll keep this preference for
              the compatibility check.
            </p>
          </div>
        )}
        <div className="mt-6">
          <label htmlFor="brief-budget" className="text-base font-medium">
            What’s your weekly equipment budget?{" "}
            <span className="font-normal text-[#727c67]">(optional)</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-6 text-base text-[#727c67]">
              $
            </span>
            <input
              id="brief-budget"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="No budget set"
              {...register("budget")}
              className={`${fieldClass} pl-7`}
              aria-invalid={!!errors.budget}
              aria-describedby={
                errors.budget ? "brief-budget-error" : "brief-budget-help"
              }
            />
          </div>
          <p
            id="brief-budget-help"
            className="mt-2 text-base leading-relaxed text-[#727c67]"
          >
            USD per week, for equipment. We’ll suggest a complete setup within
            it when possible.
          </p>
          <FieldError field="budget" errors={errors} />
        </div>
      </fieldset>
      <div className="border-t border-[#edf0e7] pt-5">
        <button
          type="button"
          onClick={() => update("measureRoom", !draft.measureRoom)}
          aria-expanded={draft.measureRoom}
          aria-controls="brief-room-fields"
          className="flex min-h-12 w-full items-center justify-between gap-3 text-left text-base font-medium text-[#40583a]"
        >
          Know your room measurements?{" "}
          <span className="font-normal">
            {draft.measureRoom ? "Hide" : "Add"}
          </span>
        </button>
        <div id="brief-room-fields" hidden={!draft.measureRoom}>
          <p className="mb-4 mt-2 text-base leading-relaxed text-[#727c67]">
            Optional. The preview keeps products at their actual scale. You can
            also measure and adjust later.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {(["width", "depth", "height"] as const).map((axis) => (
              <div key={axis}>
                <label
                  htmlFor={`brief-${axis}`}
                  className="text-base font-medium capitalize"
                >
                  Room {axis} (m)
                </label>
                <input
                  id={`brief-${axis}`}
                  type="number"
                  inputMode="decimal"
                  min={roomLimits[axis][0]}
                  max={roomLimits[axis][1]}
                  step="0.01"
                  {...register(`dimensions.${axis}`)}
                  className={fieldClass}
                  aria-invalid={!!errors[axis]}
                  aria-describedby={
                    errors[axis] ? `brief-${axis}-error` : "brief-room-help"
                  }
                />
                <FieldError field={axis} errors={errors} />
              </div>
            ))}
          </div>
          <p
            id="brief-room-help"
            className="mt-3 text-base leading-relaxed text-[#727c67]"
          >
            Width & depth: 2.4–10 m. Height: 2.2–5 m. Room preview, not a
            delivery or fit guarantee.
          </p>
        </div>
      </div>
    </div>
  );
}
