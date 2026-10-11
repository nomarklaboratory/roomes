import { cn } from "@/lib/cn";

export function ProductHoldRing({ charging }: { charging: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn(
        "absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 drop-shadow-md",
        charging && "scale-110",
      )}
    >
      <circle
        cx="24"
        cy="24"
        r="18.5"
        fill="#344c32"
        fillOpacity="0.94"
        stroke="white"
        strokeOpacity="0.9"
        strokeWidth="2"
      />
      <circle
        cx="24"
        cy="24"
        r="18.5"
        fill="none"
        pathLength="100"
        stroke="#d9efad"
        strokeDasharray="100"
        strokeDashoffset={charging ? 0 : 100}
        strokeLinecap="round"
        strokeWidth="3.5"
        transform="rotate(-90 24 24)"
        className="transition-[stroke-dashoffset] duration-[420ms] ease-linear"
      />
    </svg>
  );
}
