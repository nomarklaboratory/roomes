"use client";
import Link from "next/link";
import { useCheckout } from "@/hooks/use-checkout";
import { useWorkspaceStore } from "./studio-provider";
import { CheckoutForm, CheckoutReview } from "./checkout-form";
import { CheckoutSummary } from "./checkout-summary";
import { Icon } from "./icon";

export function Checkout() {
  const setup = useWorkspaceStore((state) => state.history.present);
  const loaded = useWorkspaceStore((state) => state.loaded);
  const checkout = useCheckout(setup);
  return (
    <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
      <header className="flex min-h-22 items-center justify-between gap-4 border-b border-[#e0e5d8]">
        <Link
          href="/"
          aria-label="monis.rent workspace studio"
          className="text-3xl font-extrabold tracking-[-1.5px]"
        >
          monis<span className="text-[#70864f]">.</span>
          <span className="text-xl font-normal tracking-tight">rent</span>
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-[#5d7051]"
        >
          <Icon name="back" size={18} /> Back to studio
        </Link>
      </header>
      <main className="pb-12 pt-8 sm:pt-12">
        <nav
          aria-label="Checkout progress"
          className="mb-7 flex items-center gap-3 text-base text-[#7b8472]"
        >
          <Link href="/" className="underline-offset-4 hover:underline">
            Your workspace
          </Link>
          <Icon name="arrow" size={16} />
          <span aria-current="page" className="font-medium text-[#3e5736]">
            Checkout
          </span>
        </nav>
        <h1 className="text-4xl font-medium tracking-[-1.5px] sm:text-5xl">
          Make room for good work.
        </h1>
        <p className="mb-9 mt-3 max-w-xl text-base leading-relaxed text-[#727c67]">
          Your workspace, your schedule. Review your setup and tell us where
          you’d like it delivered.
        </p>
        {!loaded ? (
          <p
            role="status"
            className="rounded-3xl border border-[#e1e4da] p-8 text-base"
          >
            Loading your setup…
          </p>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8">
            <div>
              {checkout.reviewing ? (
                <CheckoutReview checkout={checkout} />
              ) : (
                <CheckoutForm checkout={checkout} />
              )}
            </div>
            <CheckoutSummary />
          </div>
        )}
      </main>
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e0e5d8] py-6 text-base text-[#7b8472]">
        <span>Good spaces. Better days.</span>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-[#5d7051]"
        >
          Keep creating <Icon name="arrow" size={18} />
        </Link>
      </footer>
    </div>
  );
}
