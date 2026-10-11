"use client";
import Link from "next/link";
import { useBlueprint } from "@/hooks/use-blueprint";
import { BlueprintTabs } from "./blueprint-tabs";
import { BlueprintMap } from "./blueprint-map";
import { BlueprintItemList } from "./blueprint-item-list";
import { Icon } from "./icon";

const instructions = {
  room: "Measure from the left and back walls to the nearest furniture edges. Arrows show the front of each product.",
  desk: "Measure from the left and back edges of your tabletop to each accessory. Surface height includes any mat underneath.",
  wall: "Measure from the left wall edge to the product's left edge, and from the floor to its bottom edge.",
};
export function Blueprint() {
  const blueprint = useBlueprint();
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 text-base sm:px-8">
      <header className="flex min-h-22 flex-wrap items-center justify-between gap-3 border-b border-[#dce3d4] py-4">
        <Link href="/" className="text-3xl font-semibold tracking-tight">
          monis<span className="text-[#70864f]">.</span>rent
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-[#3f583b]"
        >
          <Icon name="back" size={18} /> Back to studio
        </Link>
      </header>
      <main className="py-8 sm:py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <h1 className="text-4xl font-medium tracking-tight">
              Your setup blueprint
            </h1>
            <p className="mt-3 max-w-prose text-base leading-relaxed text-stone-600">
              Take the guesswork out of placing your setup. Match the numbers,
              then measure from the edges shown.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void blueprint.exportPdf()}
            disabled={
              !blueprint.loaded ||
              blueprint.moving ||
              blueprint.status === "saving"
            }
            className="flex min-h-12 items-center gap-2 rounded-xl bg-[#3f583b] px-5 text-base font-medium text-white hover:bg-[#30482e]"
          >
            <Icon name="box" size={20} />{" "}
            {blueprint.status === "saving" ? "Preparing PDF…" : "Download PDF"}
          </button>
        </div>
        {blueprint.moving && (
          <p role="status" className="mb-5 rounded-xl bg-[#edf3e5] p-4">
            Place or cancel the moving item in the studio before exporting.
          </p>
        )}
        {blueprint.storageWarning && (
          <p role="status" className="mb-5 text-stone-600">
            Device storage unavailable. Download your PDF to keep a copy of the
            placement guide.
          </p>
        )}
        {blueprint.status === "error" && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            Could not download the PDF. Your blueprint is still here. Select
            Download PDF to try again.
          </p>
        )}
        {blueprint.status === "saved" && (
          <p role="status" className="mb-5 text-[#3f583b]">
            Your blueprint PDF has been downloaded.
          </p>
        )}
        {!blueprint.loaded ? (
          <p role="status">Loading your setup…</p>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23.125rem]">
            <section
              className="min-w-0 rounded-3xl border border-[#dce3d4] bg-white p-4 sm:p-6"
              aria-label="Placement drawings"
            >
              <BlueprintTabs
                views={blueprint.document.views}
                selected={blueprint.view.id}
                onChange={blueprint.setViewId}
              />
              <p className="mt-5 max-w-prose text-base leading-relaxed text-stone-600">
                {instructions[blueprint.view.id]}
              </p>
              <div
                role="tabpanel"
                id="blueprint-drawing"
                aria-labelledby={`blueprint-tab-${blueprint.view.id}`}
                className="mt-4 overflow-x-auto rounded-xl border border-[#e6ebdf] bg-[#fafbf7]"
              >
                <BlueprintMap
                  view={blueprint.view}
                  selected={blueprint.selected}
                  onSelect={blueprint.select}
                />
              </div>
              <p className="mt-4 max-w-prose text-base text-stone-600">
                All distances in cm, rounded to 1 mm. Scroll the drawing on
                smaller screens.
              </p>
              <div className="mt-4 border-t border-[#e6ebdf] pt-4">
                <p className="max-w-prose text-base leading-relaxed text-stone-600">
                  Check the room dimensions against your measurements. Use the
                  product manufacturer’s instructions for assembly and mounting.
                </p>
              </div>
            </section>
            <aside aria-label="Placement measurements">
              <h2 className="mb-4 text-xl font-medium">
                Your products · {blueprint.document.items.length}
              </h2>
              <BlueprintItemList
                items={blueprint.document.items}
                selected={blueprint.selected}
                onSelect={blueprint.select}
              />
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
