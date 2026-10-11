import type { z } from "zod";
import type {
  checkoutSchema,
  rentalBriefSchema,
  roomDimensionsSchema,
} from "../lib/form-schemas";

export type BriefFormInput = z.input<typeof rentalBriefSchema>;
export type BriefFormOutput = z.output<typeof rentalBriefSchema>;
export type RoomFormInput = z.input<typeof roomDimensionsSchema>;
export type RoomFormOutput = z.output<typeof roomDimensionsSchema>;
export type CheckoutFormInput = z.input<typeof checkoutSchema>;
export type CheckoutFormOutput = z.output<typeof checkoutSchema>;
