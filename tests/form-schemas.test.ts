import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkoutSchema,
  rentalBriefSchema,
  roomDimensionsSchema,
} from "../lib/form-schemas.ts";
import { rentalBriefDraft } from "../lib/rental-brief-form.ts";
import { initialHistory, baliToday } from "../lib/workspace.ts";
import { nextDeliveryDate } from "../lib/checkout.ts";

test("brief keeps optional dimensions inactive, rejects blank enabled dimensions and unsafe budgets", () => {
  const draft = rentalBriefDraft(initialHistory().present, null, false);
  draft.dimensions.width = "";
  assert.ok(rentalBriefSchema.safeParse(draft).success);
  assert.equal(
    rentalBriefSchema.safeParse({ ...draft, measureRoom: true }).success,
    false,
  );
  for (const budget of ["0", "-5", "1.234", "Infinity", "999999999999999999"])
    assert.equal(
      rentalBriefSchema.safeParse({ ...draft, budget }).success,
      false,
    );
  const valid = rentalBriefSchema.parse({ ...draft, budget: " 12.50 " });
  assert.equal(valid.weeklyBudgetCents, 1250);
  assert.equal(valid.room, null);
  assert.equal(
    roomDimensionsSchema.safeParse({ width: "", depth: "3", height: "2.6" })
      .success,
    false,
  );
});
test("checkout gives field-specific errors and validates tomorrow using Bali's current date", () => {
  const details = {
    name: " Alex ",
    email: "alex@example.com",
    phone: "+6281234567",
    area: "Canggu",
    address: " Villa 1 ",
    notes: "",
    date: nextDeliveryDate(),
  };
  const valid = checkoutSchema.parse(details);
  assert.equal(valid.name, "Alex");
  assert.equal(valid.address, "Villa 1");
  const result = checkoutSchema.safeParse({
    ...details,
    email: "bad",
    date: baliToday(),
    name: " ",
  });
  assert.equal(result.success, false);
  if (!result.success)
    assert.deepEqual(
      result.error.issues.map((issue) => issue.path[0]),
      ["name", "email", "date"],
    );
});
