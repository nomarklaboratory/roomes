"use client";
import Link from "next/link";
import { durations, money } from "@/lib/catalog";
import { useRental } from "@/hooks/use-rental";
import { useRentalBriefStore, useWorkspaceStore } from "./studio-provider";
import { RentalPolicyNote } from "./rental-policy-note";
import { roomLabel } from "@/lib/room";
import { ProductPhoto } from "./product-photo";
import { Icon } from "./icon";

export function CheckoutSummary() {
  const { setup, rental } = useRental();
  const change = useWorkspaceStore((state) => state.change);
  const budget = useRentalBriefStore(
    (state) => state.brief?.weeklyBudgetCents ?? null,
  );
  return (
    <aside
      className="rounded-3xl border border-[#dde2d5] bg-[#f0f3e9] p-5 sm:p-7 lg:sticky lg:top-6"
      aria-label="Order summary"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">Your setup</h2>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-[#4e6541] underline underline-offset-4"
        >
          Edit <Icon name="back" size={18} />
        </Link>
      </div>
      <p className="mt-1 text-base text-[#687160]">
        {rental.count} items, chosen by you.
      </p>
      <p className="mt-2 text-base text-[#687160]">
        Room: {roomLabel(setup.room)}
      </p>
      <div
        role="region"
        aria-label="Rental items"
        tabIndex={0}
        className="my-6 max-h-80 overflow-y-auto pr-2"
      >
        <ul className="divide-y divide-[#dce1d3]">
          {rental.lines.map((line) => (
            <li
              key={line.product.id}
              className="flex items-center gap-3 py-4 first:pt-0"
            >
              <ProductPhoto
                product={line.product}
                compact
                finish={
                  line.product.category === "desk" ? setup.finish : undefined
                }
              />
              <div className="min-w-0 flex-1">
                <p className="text-base font-medium leading-snug">
                  {line.product.name}
                </p>
                <p className="mt-1 text-base text-[#6f7768]">
                  {line.product.brand} · Qty {line.quantity}
                </p>
                <p className="mt-1 text-base">
                  {money(line.weeklyCents)} / week
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {rental.lines.length > 3 && (
        <p className="-mt-3 mb-5 text-base text-[#687160]">
          Scroll to view all {rental.count} items
        </p>
      )}
      <fieldset>
        <legend className="mb-3 text-base font-medium">Rental duration</legend>
        <div className="grid grid-cols-4 gap-2">
          {durations.map((weeks) => (
            <button
              type="button"
              key={weeks}
              onClick={() => change({ type: "weeks", value: weeks })}
              aria-pressed={setup.weeks === weeks}
              className="min-h-12 rounded-xl border border-[#d5dccb] px-1 text-base text-[#65745b] hover:bg-white aria-pressed:border-[#435c38] aria-pressed:bg-[#435c38] aria-pressed:text-white"
            >
              {weeks} {weeks === 1 ? "week" : "weeks"}
            </button>
          ))}
        </div>
      </fieldset>
      <dl className="mt-6 space-y-3 border-t border-[#dce1d3] pt-6 text-base">
        <div className="flex justify-between gap-4">
          <dt className="text-[#65705d]">Weekly rental</dt>
          <dd>{money(rental.weeklyCents)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="font-medium">
            Total for {setup.weeks} {setup.weeks === 1 ? "week" : "weeks"}
          </dt>
          <dd
            className="text-3xl font-semibold tracking-tight"
            data-checkout-total
          >
            {money(rental.totalCents)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-base text-[#6f7768]">USD · Rental subtotal</p>
      {budget !== null && (
        <p className="mt-3 text-base text-[#6f7768]">
          {rental.weeklyCents <= budget
            ? `Within your ${money(budget)} / week equipment budget.`
            : `${money(rental.weeklyCents - budget)} / week above your equipment budget after changes.`}
        </p>
      )}
      <RentalPolicyNote />
    </aside>
  );
}
