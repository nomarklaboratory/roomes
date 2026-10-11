import Link from "next/link";

export function RentalPolicyNote() {
  return (
    <div className="mt-5 space-y-3 text-base leading-relaxed text-[#6c7562]">
      <p>Estimate · USD · Equipment only. No payment or reservation.</p>
      <details className="rounded-xl border border-[#dce2d1] bg-white/60 p-4">
        <summary className="cursor-pointer font-medium text-[#40583a]">
          Delivery, pickup & changing your plans
        </summary>
        <p className="mt-3">
          Your area and date are preferences. Delivery availability, setup,
          pickup, deposits and taxes need confirmation with monis.rent.
        </p>
        <p className="mt-3">
          Staying longer, moving accommodation, or need help with equipment?
          Check extension, moving, repair and cancellation terms before booking.
        </p>
        <Link
          href="https://monis.rent"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex min-h-11 items-center font-medium text-[#40583a] underline underline-offset-4"
        >
          Check with monis.rent{" "}
          <span className="sr-only">(opens in a new tab)</span>
        </Link>
      </details>
    </div>
  );
}
