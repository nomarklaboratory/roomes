import { dimensionLabel, finishes, money } from "@/lib/catalog";
import type { Finish, Product } from "@/types/catalog";
import { Icon } from "./icon";
import { RatingStars } from "./product-rating";

export function InspectionProductSummary({
  product,
  finish,
  rating,
  reviewCount,
  onReviews,
  onClose,
}: {
  product: Product;
  finish?: Finish;
  rating: number;
  reviewCount: number;
  onReviews: () => void;
  onClose: () => void;
}) {
  const finishName = finishes.find((item) => item.id === finish)?.name;
  return (
    <div className="min-w-0 md:col-start-2 md:row-span-2">
      <p className="text-base font-medium text-[#3f583b]">{product.brand}</p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-stone-800 sm:text-3xl">
        {product.name}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-stone-600">
        {product.subtitle}
      </p>
      <button
        type="button"
        onClick={onReviews}
        className="mt-4 flex min-h-11 flex-wrap items-center gap-2 rounded-md text-base text-stone-600 hover:text-[#3f583b]"
        aria-label={`Read ${reviewCount} reviews, rated ${rating.toFixed(1)} out of 5`}
      >
        <span className="font-semibold text-stone-800">
          {rating.toFixed(1)}
        </span>
        <RatingStars rating={rating} />
        <span className="ml-1 underline underline-offset-4">
          {reviewCount} reviews
        </span>
      </button>
      <div className="mt-5 rounded-xl bg-[#edf1e6] px-5 py-4">
        <p className="text-base text-[#526448]">Rental price</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-[#344c32]">
          {money(product.weeklyCents)}
          <span className="ml-2 text-base font-normal tracking-normal">
            / week
          </span>
        </p>
      </div>
      <dl className="my-6 space-y-4 text-base">
        <div>
          <dt className="text-stone-500">Model</dt>
          <dd className="mt-1 text-stone-800">{product.model}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Preview dimensions · W × D × H</dt>
          <dd className="mt-1 text-stone-800">{dimensionLabel(product)}</dd>
        </div>
        {finishName && (
          <div>
            <dt className="text-stone-500">Selected finish</dt>
            <dd className="mt-1 text-stone-800">{finishName}</dd>
          </div>
        )}
      </dl>
      <div className="flex flex-col gap-3">
        <a
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#3f583b] px-5 py-3 text-base font-medium text-white transition-colors hover:bg-[#30462d]"
          href={product.source}
          target="_blank"
          rel="noreferrer"
        >
          View official product <Icon name="arrow" size={18} />
        </a>
        <button
          type="button"
          onClick={onClose}
          className="min-h-12 rounded-xl border border-[#c4ceba] bg-white px-5 py-3 text-base font-medium text-[#3f583b] transition-colors hover:bg-[#f3f5ed]"
        >
          Back to room
        </button>
      </div>
    </div>
  );
}
