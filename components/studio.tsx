"use client";
import Link from "next/link";
import { useStudioFlow } from "@/hooks/use-studio-flow";
import { Icon } from "./icon";
import { StudioWorkspace } from "./studio-workspace";
import { RentalBar, StudioStatus } from "./studio-panels";
import { RentalBrief } from "./rental-brief";

export default function Studio() {
  const {
    step,
    returning,
    ready,
    openBrief,
    applyBrief,
    skipBrief,
    headingRef,
    setHelp,
    helpRef,
  } = useStudioFlow();
  return (
    <div className="site-shell w-full max-w-378 m-auto py-0 px-12 max-[1150px]:py-0 max-[1150px]:px-7 max-[900px]:py-0 max-[900px]:px-[22px] max-[700px]:py-0 max-[700px]:px-[17px]">
      <header className="site-header flex items-center justify-between h-[94px] border-b border-b-[#e4e6dc] max-[900px]:h-19 max-[700px]:h-18 max-[700px]:[&_.text-button]:text-base min-[701px]:h-[82px]">
        <Link
          href="/"
          className="brand flex items-baseline font-extrabold text-[35px] tracking-[-2px] max-[700px]:text-[31px]"
          aria-label="monis.rent workspace studio"
        >
          monis<span className="brand-dot text-[#6f8b48]">.</span>
          <span className="brand-rent text-[22px] font-[450] tracking-[-1px] ml-[1px] max-[700px]:text-[19px]">
            rent
          </span>
        </Link>
        <button
          className="text-button inline-flex items-center justify-center gap-2 min-h-11 bg-transparent border-0 py-0 px-1 text-base font-medium hover:text-[#719044]"
          onClick={() => setHelp(true)}
        >
          How it works <Icon name="info" size={17} />
        </button>
      </header>
      <main>
        <div className="hero-row flex items-center justify-between pt-[34px] pr-0 pb-[30px] pl-0 gap-6 max-[900px]:py-[27px] max-[900px]:px-0 max-[700px]:items-start max-[700px]:pt-[25px] max-[700px]:pr-0 max-[700px]:pb-[22px] max-[700px]:pl-0 max-[700px]:gap-0 max-[700px]:flex-col min-[701px]:py-[25px] min-[701px]:px-0">
          <div>
            <h1
              className="focus:outline-none text-[clamp(42px,_4.1vw,_63px)] font-[450] leading-[1.13] tracking-[-2.8px] mt-[10px] mr-0 mb-[10px] ml-0 [&_em]:font-serif [&_em]:font-normal [&_em]:text-[#627746] max-[700px]:text-[45px] max-[700px]:tracking-[-2px] max-[700px]:my-[10px] max-[700px]:mx-0 min-[701px]:text-[clamp(42px,_4vw,_57px)]"
              tabIndex={-1}
              ref={headingRef}
            >
              {ready && step === "brief" ? (
                <>
                  Land in Bali. <em>Get to work.</em>
                </>
              ) : (
                <>
                  Find your <em>flow.</em>
                </>
              )}
            </h1>
            <p className="hero-copy text-[#69715f] text-base m-0 tracking-[0.05px] max-[700px]:text-base max-[700px]:leading-[1.6]">
              {ready && step === "brief"
                ? "Tell us a little about your stay. We’ll give your workspace a head start."
                : "Design your workspace. Make it yours."}
            </p>
          </div>
          {ready && step === "design" && (
            <button
              type="button"
              onClick={openBrief}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#dce1d2] px-4 text-base font-medium text-[#55694b] hover:bg-[#eef2e5]"
            >
              Edit rental brief <Icon name="arrow" size={17} />
            </button>
          )}
          {ready && step === "brief" && (
            <button
              type="button"
              onClick={skipBrief}
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-base font-medium text-[#55694b] underline underline-offset-4"
            >
              {returning ? "Keep my current setup" : "Skip rental brief"}
              <Icon name="arrow" size={17} />
            </button>
          )}
        </div>
        {!ready ? (
          <p
            role="status"
            className="rounded-3xl border border-[#e1e4da] p-8 text-base text-[#727c67]"
          >
            Loading your workspace…
          </p>
        ) : step === "brief" ? (
          <RentalBrief onApply={applyBrief} onSkip={skipBrief} />
        ) : (
          <>
            <div className="studio-layout grid grid-cols-1 items-start gap-6">
              <StudioWorkspace editable />
            </div>
            <RentalBar />
          </>
        )}
        {ready && <StudioStatus />}
      </main>
      <dialog
        ref={helpRef}
        className="help-dialog text-[#293329] border border-[#dce2cd] rounded-[18px] p-[35px] bg-[#fafbf3] w-[min(470px,_90vw)] fixed [inset:0] m-auto [&::backdrop]:bg-[#27382360] [&::backdrop]:[backdrop-filter:blur(5px)] [&_h2]:text-[28px] [&_h2]:mt-4 [&_h2]:mr-0 [&_h2]:mb-[25px] [&_h2]:ml-0 [&_ol]:[list-style:none] [&_ol]:p-0 [&_ol]:m-0 [&_li]:flex [&_li]:gap-4 [&_li]:mb-5 [&_li]:text-base [&_li]:text-[#7b896c] [&_li]:leading-[1.7] [&_li_b]:text-[#68834b] [&_li_b]:text-base [&_li_strong]:block [&_li_strong]:text-[#3e5630] [&_li_strong]:font-medium [&_li_strong]:mb-[3px] [&_.primary-button]:w-full [&_.primary-button]:mt-[22px]"
        onCancel={() => setHelp(false)}
        onClose={() => setHelp(false)}
        aria-labelledby="help-title"
      >
        <button
          className="icon-button inline-flex items-center justify-center border border-[#dee2d4] bg-transparent w-8 h-8 rounded-[7px] p-0 max-[700px]:min-h-9 max-[700px]:min-w-9 dialog-close absolute top-[14px] right-[14px]"
          aria-label="Close how it works"
          onClick={() => setHelp(false)}
        >
          <Icon name="close" />
        </button>
        <div className="eyebrow text-base font-semibold tracking-[1.7px] text-[#728163]">
          IT STARTS WITH YOUR SPACE
        </div>
        <h2
          className="text-[24px] font-[450] tracking-[-0.9px] leading-[1.2] mt-[7px] mr-0 mb-0 ml-0"
          id="help-title"
        >
          Work from somewhere
          <br />
          that feels like you.
        </h2>
        <ol>
          <li>
            <b>01</b>
            <span>
              <strong>Tell us about your stay</strong>Use the rental brief for a
              suggested setup, or skip straight to designing.
            </span>
          </li>
          <li>
            <b>02</b>
            <span>
              <strong>Make it your own</strong>Swap the furniture, add little
              extras, and drag items into place. Zoom or go fullscreen for a
              closer look. Choose Inside to explore at a 170 cm person&apos;s
              eye level, then Sit in chair to try the seated view.
            </span>
          </li>
          <li>
            <b>03</b>
            <span>
              <strong>Take a closer look</strong>Choose your rental duration,
              then open checkout to add your delivery details.
            </span>
          </li>
        </ol>

        <button
          className="primary-button flex items-center justify-between bg-[#d5ed97] text-[#354726] border border-[#cce18f] min-h-[47px] py-0 px-[21px] rounded-[7px] gap-7 text-base font-[550] hover:bg-[#c6e481]"
          onClick={() => setHelp(false)}
        >
          Let’s make some space <Icon name="arrow" />
        </button>
      </dialog>
    </div>
  );
}
