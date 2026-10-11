import { cn } from "@/lib/cn";

const fillWidths = [
  "w-0",
  "w-[10%]",
  "w-[20%]",
  "w-[30%]",
  "w-[40%]",
  "w-1/2",
  "w-[60%]",
  "w-[70%]",
  "w-[80%]",
  "w-[90%]",
  "w-full",
];

export function RatingStars({ rating }: { rating: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex gap-0.5 text-xl leading-none"
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.round(Math.max(0, Math.min(1, rating - index)) * 10);
        return (
          <span key={index} className="relative inline-block text-stone-300">
            ★
            <span
              className={cn(
                "absolute left-0 top-0 overflow-hidden text-amber-600",
                fillWidths[fill],
              )}
            >
              ★
            </span>
          </span>
        );
      })}
    </span>
  );
}
