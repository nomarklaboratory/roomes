import { cn } from "@/lib/cn";
import type { useProductReviews } from "@/hooks/use-product-reviews";
import type {
  DemoProductReview,
  ReviewFilter,
  ReviewScore,
} from "@/types/product-reviews";
import { RatingStars } from "./product-rating";

function ReviewCard({ review }: { review: DemoProductReview }) {
  const initials = review.author
    .split(" ")
    .map((part) => part[0])
    .join("");
  return (
    <article className="border-t border-stone-200 py-6 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#edf1e6] text-base font-medium text-[#3f583b]"
        >
          {initials}
        </span>
        <div>
          <p className="text-base font-medium text-stone-800">
            {review.author}
          </p>
        </div>
      </div>
      <div
        className="mt-3 flex items-center gap-2"
        aria-label={`${review.rating} out of 5 stars`}
      >
        <RatingStars rating={review.rating} />
        <span className="text-base text-stone-600">{review.rating}/5</span>
      </div>
      <h4 className="mt-3 text-base font-semibold text-stone-800">
        {review.title}
      </h4>
      <p className="mt-1 max-w-prose text-base leading-relaxed text-stone-600">
        {review.comment}
      </p>
    </article>
  );
}

export function ProductReviews({
  reviews,
}: {
  reviews: ReturnType<typeof useProductReviews>;
}) {
  const filters: { value: ReviewFilter; label: string }[] = [
    { value: "all", label: `All (${reviews.reviews.length})` },
    { value: 5, label: `5 stars (${reviews.counts[5]})` },
    { value: 4, label: `4 stars (${reviews.counts[4]})` },
  ];
  return (
    <div>
      <h3 className="text-xl font-semibold text-stone-800">
        Ratings &amp; reviews
      </h3>
      <div className="mt-6 grid gap-8 md:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-5 self-start rounded-2xl border border-stone-200 bg-[#f7f8f2] p-5 md:block">
          <div
            aria-label={`${reviews.average.toFixed(1)} out of 5, from ${reviews.reviews.length} reviews`}
          >
            <p className="text-4xl font-semibold tracking-tight text-stone-800">
              {reviews.average.toFixed(1)}
              <span className="ml-1 text-base font-normal text-stone-500">
                / 5
              </span>
            </p>
            <div className="mt-3">
              <RatingStars rating={reviews.average} />
            </div>
            <p className="mt-2 text-base text-stone-600">
              {reviews.reviews.length} reviews
            </p>
          </div>
          <div className="space-y-2 md:mt-5" aria-label="Rating distribution">
            {([5, 4, 3, 2, 1] satisfies ReviewScore[]).map((score) => (
              <div
                key={score}
                className="flex items-center gap-3 text-base text-stone-600"
              >
                <span className="w-8 shrink-0">{score} ★</span>
                <progress
                  value={reviews.counts[score]}
                  max={reviews.reviews.length}
                  aria-label={`${score} stars: ${reviews.counts[score]} reviews`}
                  className="h-2 w-full overflow-hidden rounded-full bg-stone-200 [&::-webkit-progress-bar]:bg-stone-200 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-amber-600 [&::-moz-progress-bar]:bg-amber-600"
                />
                <span className="w-3 shrink-0 text-right">
                  {reviews.counts[score]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <div
            className="mb-6 flex flex-wrap gap-2"
            aria-label="Filter reviews"
          >
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={reviews.filter === filter.value}
                onClick={() => reviews.setFilter(filter.value)}
                className={cn(
                  "min-h-11 rounded-lg border px-4 py-2 text-base transition-colors",
                  reviews.filter === filter.value
                    ? "border-[#3f583b] bg-[#edf1e6] text-[#3f583b]"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-400",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div aria-live="polite" aria-label="Review comments">
            {reviews.visible.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
