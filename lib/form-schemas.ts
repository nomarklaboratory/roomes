import { z } from "zod";
import { baliAreas } from "./rental-brief.ts";
import { normalizeRoom, roomLimits } from "./room.ts";
import { validDeliveryDate } from "./workspace.ts";

export const numericField = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value !== "" &&
        Number.isFinite(Number(value)) &&
        Number(value) >= min &&
        Number(value) <= max,
      { error: `Enter ${label} between ${min} and ${max}.` },
    )
    .transform(Number);

export const roomDimensionsSchema = z.object({
  width: numericField("a room width in metres", ...roomLimits.width),
  depth: numericField("a room depth in metres", ...roomLimits.depth),
  height: numericField("a room height in metres", ...roomLimits.height),
});

const optionalDate = z
  .string()
  .refine((value) => !value || validDeliveryDate(value), {
    error: "Choose a date from tomorrow onwards in Bali, or leave it blank.",
  });
export const rentalBriefSchema = z
  .object({
    area: z
      .string()
      .refine((value) => !value || baliAreas.some((area) => area === value), {
        error: "Choose a Bali area, or leave it as not sure yet.",
      }),
    date: optionalDate,
    weeks: z.union([z.literal(1), z.literal(2), z.literal(4), z.literal(8)]),
    workStyle: z.enum(["everyday", "coding", "creative"]),
    screens: z.enum(["recommend", "none", "standard", "wide", "dual"]),
    laptopConnection: z.enum(["unsure", "usb-c", "hdmi"]),
    budget: z
      .string()
      .trim()
      .refine(
        (value) =>
          !value ||
          (/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(value) &&
            Number(value) > 0 &&
            Number.isSafeInteger(Math.round(Number(value) * 100))),
        {
          error:
            "Enter a positive USD amount with up to two decimal places, or leave it blank.",
        },
      ),
    measureRoom: z.boolean(),
    dimensions: z.object({
      width: z.string(),
      depth: z.string(),
      height: z.string(),
    }),
  })
  .superRefine((value, context) => {
    if (!value.measureRoom) return;
    const result = roomDimensionsSchema.safeParse(value.dimensions);
    if (!result.success)
      for (const issue of result.error.issues)
        context.addIssue({
          code: "custom",
          path: ["dimensions", ...issue.path],
          message: issue.message,
        });
  })
  .transform(({ budget, dimensions, measureRoom, ...value }) => ({
    ...value,
    weeklyBudgetCents: budget ? Math.round(Number(budget) * 100) : null,
    room: measureRoom
      ? normalizeRoom(roomDimensionsSchema.parse(dimensions))
      : null,
  }));

export const checkoutSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your full name.")
    .max(120, "Use at most 120 characters."),
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: "Enter a valid email address." })),
  phone: z.string().trim().min(1, "Enter your phone number."),
  area: z.string().refine((value) => baliAreas.some((area) => area === value), {
    error: "Choose your delivery area.",
  }),
  address: z
    .string()
    .trim()
    .min(1, "Enter your delivery address.")
    .max(600, "Use at most 600 characters."),
  date: z.string().refine(validDeliveryDate, {
    error: "Choose a delivery date from tomorrow onwards in Bali.",
  }),
  notes: z.string().trim().max(1000, "Use at most 1,000 characters."),
});
