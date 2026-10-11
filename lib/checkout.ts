import { baliToday, quote } from "./workspace.ts";
import type { Setup } from "../types/workspace.ts";
import type { DeliveryDetails } from "../types/checkout.ts";
import type { RentalBrief } from "../types/rental-brief.ts";

export function nextDeliveryDate() {
  const tomorrow = new Date(`${baliToday()}T00:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

export function rentalRequest(
  setup: Setup,
  delivery: DeliveryDetails,
  brief: RentalBrief | null = null,
) {
  const rental = quote(setup);
  return {
    status: "rental-request",
    createdAt: new Date().toISOString(),
    delivery,
    preferences: brief
      ? {
          workStyle: brief.workStyle,
          screens: brief.screens,
          laptopConnection: brief.laptopConnection,
          weeklyBudgetCents: brief.weeklyBudgetCents,
          compatibilityVerified: false,
        }
      : undefined,
    currency: "USD",
    weeks: setup.weeks,
    weeklyCents: rental.weeklyCents,
    totalCents: rental.totalCents,
    products: rental.lines.map(({ product, quantity, weeklyCents }) => ({
      id: product.id,
      name: product.name,
      model: product.model,
      quantity,
      weeklyCents,
    })),
    setup,
  };
}
