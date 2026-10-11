"use client";
import type { RefObject } from "react";
import { cn } from "@/lib/cn";
import { useInspectionFocus } from "@/hooks/use-inspection-focus";
import { useInspectionSections } from "@/hooks/use-inspection-sections";
import { useProductReviews } from "@/hooks/use-product-reviews";
import type { useProductInspection } from "@/hooks/use-product-inspection";
import { Icon } from "./icon";
import {
  InspectionGallery,
  InspectionMediaDetails,
} from "./inspection-gallery";
import { InspectionProductDetails } from "./inspection-product-details";
import { InspectionProductSummary } from "./inspection-product-summary";
import { ProductReviews } from "./product-reviews";

type Inspection = ReturnType<typeof useProductInspection>;

function InspectionContent({ inspection }: { inspection: Inspection }) {
  const { product } = inspection.target;
  const reviews = useProductReviews(product);
  const {
    scrollRef,
    overviewRef,
    specificationsRef,
    reviewsRef,
    active,
    show,
    updateActive,
  } = useInspectionSections();
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "specifications", label: "Specifications" },
    { id: "reviews", label: `Reviews (${reviews.reviews.length})` },
  ] as const;
  return (
    <>
      <nav
        aria-label="Product sections"
        className="flex shrink-0 gap-5 overflow-x-auto border-b border-stone-200 px-5 sm:gap-8 sm:px-8"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => show(tab.id)}
            aria-current={active === tab.id ? "location" : undefined}
            className={cn(
              "min-h-14 shrink-0 border-b-2 px-1 py-3 text-base font-medium transition-colors",
              active === tab.id
                ? "border-[#3f583b] text-[#3f583b]"
                : "border-transparent text-stone-500 hover:text-stone-800",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div
        ref={scrollRef}
        onScroll={updateActive}
        data-inspection-scroll
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8"
      >
        <section
          ref={overviewRef}
          aria-label="Product overview"
          className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-8"
        >
          <InspectionGallery
            active={inspection.active}
            media={inspection.media}
            context={inspection.context}
            selectMedia={inspection.selectMedia}
          />
          <InspectionProductSummary
            product={product}
            finish={inspection.finish}
            rating={reviews.average}
            reviewCount={reviews.reviews.length}
            onReviews={() => show("reviews")}
            onClose={inspection.close}
          />
          <InspectionMediaDetails media={inspection.active} />
        </section>
        <section
          ref={specificationsRef}
          aria-label="Product specifications"
          className="mt-8 border-t border-stone-200 pt-8"
        >
          <InspectionProductDetails product={product} />
        </section>
        <section
          ref={reviewsRef}
          aria-label="Product reviews"
          className="mt-8 min-h-full border-t border-stone-200 pt-8"
        >
          <ProductReviews reviews={reviews} />
        </section>
      </div>
    </>
  );
}

export function ProductInspector({
  inspection,
  trigger,
}: {
  inspection: Inspection;
  trigger: RefObject<HTMLButtonElement | null>;
}) {
  const ref = useInspectionFocus(inspection.isOpen, inspection.close, trigger);
  if (!inspection.isOpen) return null;
  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      data-product-inspector
      aria-label="Real product inspection"
      onCancel={(event) => {
        event.preventDefault();
        inspection.close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) inspection.close();
      }}
      className="fixed inset-0 m-auto flex h-[min(56.25rem,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-6xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-[#fcfbf7] p-0 text-stone-800 shadow-2xl outline-none backdrop:bg-stone-900/40 backdrop:backdrop-blur-sm max-sm:h-[calc(100dvh-1rem)] max-sm:max-h-[calc(100dvh-1rem)] max-sm:w-[calc(100vw-1rem)]"
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-4 sm:px-8">
        <p className="hidden text-lg font-semibold text-stone-800 sm:block">
          Product details
        </p>
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
          <label className="flex min-w-0 flex-1 items-center gap-3 text-base text-stone-600">
            <span className="hidden shrink-0 sm:block">In your room</span>
            <select
              aria-label="Inspect items in your setup"
              value={inspection.target.id}
              onChange={(event) => inspection.inspect(event.target.value)}
              className="min-h-11 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-3 py-2 text-base text-stone-800 sm:max-w-72"
            >
              {inspection.targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={inspection.close}
            aria-label="Close product inspection"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-100"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
      </header>
      <InspectionContent key={inspection.context} inspection={inspection} />
    </dialog>
  );
}
