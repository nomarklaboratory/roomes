"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { defaultRoom, roomLabel, roomLimits } from "@/lib/room";
import { roomDimensionsSchema } from "@/lib/form-schemas";
import type { RoomDimensions as Dimensions } from "@/types/placement";
import type { RoomFormInput, RoomFormOutput } from "@/types/forms";
import type { Action } from "@/types/workspace";
import { useEditorStore } from "./studio-provider";
import { FieldError } from "./ui/field-error";

export function RoomDimensions({
  room,
  onChange,
}: {
  room: Dimensions;
  onChange: (action: Action) => void;
}) {
  const moving = useEditorStore((state) => state.session !== null);
  return (
    <details className="mb-3 rounded-xl border border-[#dce1d2] bg-[#f7f7ef] p-3">
      <summary className="cursor-pointer text-base font-medium text-[#3f583b]">
        Room dimensions · {roomLabel(room)}
      </summary>
      <DimensionForm
        key={roomLabel(room)}
        room={room}
        onChange={onChange}
        disabled={moving}
      />
    </details>
  );
}
const roomDraft = (room: Dimensions): RoomFormInput => ({
  width: String(room.width),
  depth: String(room.depth),
  height: String(room.height),
});
function DimensionForm({
  room,
  onChange,
  disabled,
}: {
  room: Dimensions;
  onChange: (action: Action) => void;
  disabled: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormInput, unknown, RoomFormOutput>({
    resolver: zodResolver(roomDimensionsSchema),
    defaultValues: roomDraft(room),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  return (
    <form
      noValidate
      onSubmit={handleSubmit((dimensions) =>
        onChange({ type: "room", dimensions }),
      )}
      className="mt-3 space-y-3"
      aria-label="Customize room dimensions"
    >
      <fieldset disabled={disabled} className="grid gap-3 sm:grid-cols-3">
        {(["width", "depth", "height"] as const).map((axis) => (
          <div key={axis} className="min-w-0">
            <label
              htmlFor={`room-${axis}`}
              className="text-base capitalize text-stone-600"
            >
              Room {axis} (m)
            </label>
            <input
              id={`room-${axis}`}
              type="number"
              inputMode="decimal"
              step="0.01"
              min={roomLimits[axis][0]}
              max={roomLimits[axis][1]}
              {...register(axis)}
              className="mt-1 block min-h-11 w-full rounded-lg border border-[#cbd4bf] bg-white px-3 text-base text-stone-800 aria-invalid:border-red-600"
              aria-invalid={!!errors[axis]}
              aria-describedby={
                errors[axis] ? `room-${axis}-error` : "room-dimension-help"
              }
            />
            <FieldError
              id={`room-${axis}-error`}
              message={errors[axis]?.message}
            />
          </div>
        ))}
      </fieldset>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={disabled}
          className="min-h-11 rounded-lg bg-[#3f583b] px-4 text-base text-white hover:bg-[#526c49]"
        >
          Apply room size
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const dimensions = defaultRoom();
            reset(roomDraft(dimensions));
            onChange({ type: "room", dimensions });
          }}
          className="min-h-11 rounded-lg border border-[#cbd4bf] px-3 text-base text-[#3f583b]"
        >
          Reset room size
        </button>
        <span className="text-base text-stone-500">
          {Number((room.width * room.depth).toFixed(2))} m² floor area
        </span>
      </div>
      <p
        id="room-dimension-help"
        className="text-base leading-relaxed text-stone-500"
      >
        Width and depth 2.4–10 m · Height 2.2–5 m. Furniture keeps its actual
        size; items outside a smaller room move inside.
      </p>
      {disabled && (
        <p role="status" className="text-base text-[#3f583b]">
          Place or cancel the moving item before changing room size.
        </p>
      )}
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="text-base text-red-700">
          Check the highlighted room measurements.
        </p>
      )}
    </form>
  );
}
