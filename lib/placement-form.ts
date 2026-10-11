import { z } from "zod";
import { numericField } from "./form-schemas.ts";
import { placementBounds } from "./placement.ts";
import { placementMeasurements } from "./blueprint.ts";
import type { Setup } from "../types/workspace.ts";

export function placementSchema(setup: Setup, id: string) {
  const bounds = placementBounds(setup, id);
  if (!bounds) throw new Error("Product no longer exists.");
  const min = placementMeasurements(setup, id, {
    x: bounds.x[0],
    z: bounds.z[0],
    y: bounds.y?.[0],
  });
  const max = placementMeasurements(setup, id, {
    x: bounds.x[1],
    z: bounds.z[1],
    y: bounds.y?.[1],
  });
  return z.object({
    left: numericField("a left edge distance in cm", min.left, max.left),
    offset: numericField("a placement distance in cm", min.offset, max.offset),
  });
}
