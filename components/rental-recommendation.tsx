import { catalog, money } from "@/lib/catalog";
import { connectionLabels } from "@/lib/rental-brief";
import type {
  LaptopConnection,
  SetupRecommendation,
} from "@/types/rental-brief";
import { Icon } from "./icon";
import { ProductPhoto } from "./product-photo";
import { RentalPolicyNote } from "./rental-policy-note";

export function LaptopConnectionNote({
  connection,
}: {
  connection: LaptopConnection;
}) {
  return (
    <p className="mt-4 rounded-xl border border-[#dfdbc9] bg-[#faf6e9] p-4 text-base leading-relaxed text-[#71633e]">
      Laptop connection: <strong>{connectionLabels[connection]}</strong>.
      Confirm your laptop’s video output and required cables before booking.
      Compatibility is not verified.
    </p>
  );
}

export function RentalRecommendation({
  recommendation,
  connection,
  hasMonitors,
  returning,
  onSkip,
}: {
  recommendation: SetupRecommendation;
  connection: LaptopConnection;
  hasMonitors: boolean;
  returning: boolean;
  onSkip: () => void;
}) {
  const { setup, weeklyCents, totalCents, reasons, budgetShortfallCents } =
    recommendation;
  const monitors = setup.items.filter(
    (item) => catalog[item.productId].kind === "monitor",
  );
  const extras = setup.items.filter(
    (item) => catalog[item.productId].kind !== "monitor",
  );
  return (
    <aside
      aria-labelledby="recommendation-heading"
      className="rounded-3xl border border-[#dce2d2] bg-[#eef2e5] p-5 sm:p-7 lg:sticky lg:top-6"
    >
      <div className="mb-3 flex items-center gap-2 text-base font-medium text-[#667e50]">
        <Icon name="leaf" /> A little head start
      </div>
      <h2
        id="recommendation-heading"
        className="text-3xl font-medium tracking-tight"
      >
        Your suggested setup.
      </h2>
      <p className="mt-2 text-base text-[#6c7562]">
        A starting point. Make every part your own in 3D.
      </p>
      <ul className="my-5 divide-y divide-[#dce2d1]">
        {[
          { product: catalog[setup.deskId], quantity: 1 },
          { product: catalog[setup.chairId], quantity: 1 },
          ...(monitors[0]
            ? [
                {
                  product: catalog[monitors[0].productId],
                  quantity: monitors.length,
                },
              ]
            : []),
        ].map(({ product, quantity }) => (
          <li key={product.id} className="flex items-center gap-3 py-3">
            <ProductPhoto
              product={product}
              compact
              finish={product.category === "desk" ? setup.finish : undefined}
            />
            <div className="min-w-0">
              <p className="text-base font-medium">
                {product.name}
                {quantity > 1 ? ` × ${quantity}` : ""}
              </p>
              <p className="mt-1 text-base text-[#6c7562]">
                {product.category === "desk"
                  ? `${Math.round(product.width * 100)} × ${Math.round(product.depth * 100)} cm`
                  : product.brand}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {extras.length > 0 && (
        <p className="mb-5 text-base text-[#6c7562]">
          Also included:{" "}
          {extras.map((item) => catalog[item.productId].name).join(", ")}.
        </p>
      )}
      <ul className="space-y-3 text-base leading-relaxed text-[#55694b]">
        {reasons.map((reason) => (
          <li key={reason} className="flex items-start gap-2">
            <span className="mt-1">
              <Icon
                name={
                  budgetShortfallCents && reason.includes("over your budget")
                    ? "info"
                    : "check"
                }
                size={17}
              />
            </span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
      <div
        className="mt-6 border-t border-[#d6dfca] pt-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-4xl font-medium tracking-tight" data-brief-weekly>
          {money(weeklyCents)}{" "}
          <span className="text-base font-normal tracking-normal text-[#6c7562]">
            / week
          </span>
        </p>
        <p className="mt-2 text-base text-[#6c7562]" data-brief-total>
          {money(totalCents)} for {setup.weeks}{" "}
          {setup.weeks === 1 ? "week" : "weeks"}
        </p>
      </div>
      {hasMonitors && <LaptopConnectionNote connection={connection} />}
      {returning && (
        <p className="mt-5 text-base leading-relaxed text-[#6c7562]">
          Applying this suggestion replaces your current layout. Undo restores
          it.
        </p>
      )}
      <button
        type="submit"
        className="mt-6 flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-[#3e5736] px-5 text-base font-semibold text-white hover:bg-[#31452a]"
      >
        {returning ? "Use suggested setup" : "Build my workspace"}
        <Icon name="arrow" />
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="mt-2 min-h-12 w-full rounded-xl px-4 text-base font-medium text-[#55694b] underline underline-offset-4"
      >
        {returning ? "Back to my setup" : "Skip to designing"}
      </button>
      <RentalPolicyNote />
    </aside>
  );
}
