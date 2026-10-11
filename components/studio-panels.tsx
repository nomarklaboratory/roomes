"use client";
import Link from "next/link";
import { durations, money } from "@/lib/catalog";
import { useRental } from "@/hooks/use-rental";
import { useRentalBriefStore, useWorkspaceStore } from "./studio-provider";
import { Icon } from "./icon";

export function RentalBar() {
  const { setup, rental } = useRental();
  const change = useWorkspaceStore((state) => state.change);
  return (
    <div className="rental-bar flex items-center gap-6 border border-[#e4e6dc] rounded-[0.8125rem] bg-[#f0f1e8] mt-5 py-[1.125rem] px-[1.375rem] max-[900px]:p-[1.0625rem] max-[900px]:gap-[0.9375rem] max-[900px]:[&_.primary-button]:gap-[0.8125rem] max-[900px]:[&_.primary-button]:py-0 max-[900px]:[&_.primary-button]:px-[0.8125rem] max-[900px]:[&_.primary-button]:text-base max-[700px]:flex-wrap max-[700px]:gap-[1.0625rem] max-[700px]:mt-5 max-[700px]:p-[1.125rem] max-[700px]:[&_.primary-button]:gap-[0.875rem] max-[700px]:[&_.primary-button]:text-base max-[700px]:[&_.primary-button]:min-h-12 min-[701px]:shadow-[0_0.3125rem_1.25rem_#35472a0a]">
      <div className="duration-control mr-auto max-[700px]:w-full max-[700px]:m-0">
        <span className="section-label text-base tracking-[0.0781rem] font-semibold [&_>_span]:text-[#7e8578] [&_>_span]:text-base [&_>_span]:tracking-[0] [&_>_span]:font-normal">
          Rental duration
        </span>
        <div
          className="duration-options flex gap-[0.3125rem] mt-[0.5625rem] [&_button]:bg-transparent [&_button]:border [&_button]:border-[#d8ddcc] [&_button]:min-h-8 [&_button]:py-0 [&_button]:px-3 [&_button]:text-base [&_button]:rounded-[0.3125rem] [&_button]:text-[#6d795f] [&_button[aria-pressed='true']]:bg-[#fdfdf5] [&_button[aria-pressed='true']]:border-[#8e9e78] [&_button[aria-pressed='true']]:text-[#3b522e] max-[900px]:gap-[0.1875rem] max-[900px]:[&_button]:py-0 max-[900px]:[&_button]:px-[0.5625rem] max-[700px]:gap-[0.375rem] max-[700px]:[&_button]:min-h-[2.375rem] max-[700px]:[&_button]:flex-1"
          aria-label="Rental duration"
        >
          {durations.map((weeks) => (
            <button
              key={weeks}
              aria-pressed={setup.weeks === weeks}
              onClick={() => change({ type: "weeks", value: weeks })}
            >
              {weeks} {weeks === 1 ? "week" : "weeks"}
            </button>
          ))}
        </div>
      </div>
      <div className="rental-price [&_>_span]:block [&_>_span]:text-[1.875rem] [&_>_span]:font-[450] [&_>_span]:leading-[1.2] [&_>_span]:tracking-[-0.0625rem] [&_>_span_small]:text-base [&_>_span_small]:font-normal [&_>_span_small]:tracking-[0] [&_>_span_small]:text-[#71805f] [&_>_small]:block [&_>_small]:text-base [&_>_small]:text-[#76846a] [&_>_small]:mt-[0.3125rem] max-[900px]:[&_>_span]:text-[1.625rem] max-[900px]:[&_>_span_small]:text-base max-[700px]:flex-1 max-[700px]:[&_>_span]:text-[1.6875rem] max-[700px]:[&_>_span_small]:text-base max-[700px]:[&_>_small]:text-base">
        <span>
          {money(rental.totalCents)}
          <small>
            {" "}
            / {setup.weeks} {setup.weeks === 1 ? "week" : "weeks"}
          </small>
        </span>
        <small>{money(rental.weeklyCents)} per week · USD</small>
      </div>
      <Link
        href="/checkout"
        className="primary-button flex items-center justify-between bg-[#d5ed97] text-[#354726] border border-[#cce18f] min-h-[2.9375rem] py-0 px-[1.3125rem] rounded-[0.4375rem] gap-7 text-base font-[550] hover:bg-[#c6e481]"
      >
        Rent this setup <Icon name="arrow" />
      </Link>
    </div>
  );
}

function storageStatus(loaded: boolean, unavailable: boolean) {
  if (unavailable)
    return "Device storage unavailable. Changes will last for this tab.";
  if (loaded) return "Your setup saves as you go";
  return "Loading your workspace…";
}

export function StudioStatus() {
  const notice = useWorkspaceStore((state) => state.history.notice);
  const loaded = useWorkspaceStore((state) => state.loaded);
  const storageWarning = useWorkspaceStore((state) => state.storageWarning);
  const briefStorageWarning = useRentalBriefStore(
    (state) => state.storageWarning,
  );
  return (
    <div className="status-row flex justify-between py-[0.625rem] px-[0.1875rem] gap-4 min-h-[2.3125rem] text-[#7c886d] text-base max-[700px]:text-base max-[700px]:gap-[0.625rem] max-[700px]:leading-[1.7] max-[700px]:min-h-10 max-[700px]:[&_>_span]:max-w-[50%] max-[700px]:[&_>_span:last-child]:text-right">
      <span role="status" aria-live="polite">
        {notice}
      </span>
      <span>
        {storageStatus(loaded, storageWarning || briefStorageWarning)}
      </span>
    </div>
  );
}
