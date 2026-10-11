import { scaleLabel } from "@/lib/catalog";
import type { Product } from "@/types/catalog";

export function InspectionProductDetails({ product }: { product: Product }) {
  const dimensions = [
    { label: "Width", value: product.width },
    { label: "Depth", value: product.depth },
    { label: "Height", value: product.height },
  ];
  return (
    <div>
      <h3 className="text-xl font-semibold text-stone-800">Specifications</h3>
      <p className="mt-2 text-base text-stone-600">
        {scaleLabel(product)} for the model shown in your room.
      </p>
      <dl className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
        {dimensions.map((dimension) => (
          <div
            key={dimension.label}
            className="rounded-xl border border-stone-200 bg-white p-3 sm:p-4"
          >
            <dt className="text-base text-stone-500">{dimension.label}</dt>
            <dd className="mt-2 text-base font-semibold text-stone-800 sm:text-xl">
              {Number((dimension.value * 100).toFixed(1))} cm
            </dd>
          </div>
        ))}
      </dl>
      <details className="group mt-5 rounded-xl border border-stone-200 bg-[#f8f9f4] text-base text-stone-600">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium text-stone-800 [&::-webkit-details-marker]:hidden">
          Photo &amp; scale notes
          <span
            aria-hidden="true"
            className="text-xl transition-transform group-open:rotate-45"
          >
            +
          </span>
        </summary>
        <div className="space-y-4 border-t border-stone-200 px-4 py-4 leading-relaxed sm:px-5">
          {product.scale.model && (
            <p className="font-medium text-stone-800">{product.scale.model}</p>
          )}
          <p className="max-w-[80ch]">{product.scale.note}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              className="inline-flex min-h-11 items-center text-[#3f583b] underline underline-offset-4"
              href={product.scale.source}
              target="_blank"
              rel="noreferrer"
            >
              View dimension source ↗
            </a>
            <p>Checked {product.scale.checkedAt}</p>
          </div>
        </div>
      </details>
    </div>
  );
}
