import { Icon } from "./icon";
import { FieldError } from "./ui/field-error";
import { useEffect, useRef } from "react";
import Link from "next/link";
import type { useCheckout } from "@/hooks/use-checkout";
import { baliAreas } from "@/lib/rental-brief";
import { useRentalBriefStore, useWorkspaceStore } from "./studio-provider";
import { LaptopConnectionNote } from "./rental-recommendation";
import { catalog } from "@/lib/catalog";

type CheckoutFormProps = { checkout: ReturnType<typeof useCheckout> };
const fieldClass =
  "mt-2 min-h-13 w-full rounded-xl border border-[#d9dfd2] bg-white px-4 py-3 text-base placeholder:text-[#92998c] focus:border-[#60784e]";

export function CheckoutForm({ checkout }: CheckoutFormProps) {
  const {
    register,
    errors,
    review,
    minimumDate,
    isSubmitting,
    updateDelivery,
  } = checkout;
  return (
    <form
      onSubmit={review}
      noValidate
      aria-label="Rental delivery details"
      className="rounded-3xl border border-[#e1e4da] bg-white p-5 sm:p-8"
    >
      <fieldset>
        <legend className="mb-6 flex items-center gap-3 text-2xl font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#eaf0e1] text-base text-[#4e6541]">
            1
          </span>{" "}
          Your details
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label
            className="text-base font-medium sm:col-span-2"
            htmlFor="rental-name"
          >
            Full name
            <input
              id="rental-name"
              autoComplete="name"
              required
              maxLength={120}
              {...register("name")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "rental-name-error" : undefined}
              placeholder="Your full name"
              className={fieldClass}
            />
            <FieldError id="rental-name-error" message={errors.name?.message} />
          </label>
          <label className="text-base font-medium" htmlFor="rental-email">
            Email address
            <input
              id="rental-email"
              type="email"
              autoComplete="email"
              required
              {...register("email")}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "rental-email-error" : undefined}
              placeholder="you@example.com"
              className={fieldClass}
            />
            <FieldError
              id="rental-email-error"
              message={errors.email?.message}
            />
          </label>
          <label className="text-base font-medium" htmlFor="rental-phone">
            Phone number
            <input
              id="rental-phone"
              type="tel"
              autoComplete="tel"
              required
              {...register("phone")}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "rental-phone-error" : undefined}
              placeholder="+62"
              className={fieldClass}
            />
            <FieldError
              id="rental-phone-error"
              message={errors.phone?.message}
            />
          </label>
        </div>
      </fieldset>
      <fieldset className="mt-8 border-t border-[#edf0e7] pt-8">
        <legend className="float-left mb-6 flex w-full items-center gap-3 text-2xl font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#eaf0e1] text-base text-[#4e6541]">
            2
          </span>{" "}
          Delivery details
        </legend>
        <div className="clear-both grid gap-5 sm:grid-cols-2">
          <div className="text-base font-medium">
            <label htmlFor="rental-area">Area</label>
            <select
              id="rental-area"
              required
              {...register("area", {
                onChange: (event) => updateDelivery("area", event.target.value),
              })}
              aria-invalid={!!errors.area}
              aria-describedby={errors.area ? "rental-area-error" : undefined}
              className={fieldClass}
            >
              <option value="" disabled>
                Select your area
              </option>
              {baliAreas.map((area) => (
                <option key={area}>{area}</option>
              ))}
            </select>
            <FieldError id="rental-area-error" message={errors.area?.message} />
          </div>
          <label className="text-base font-medium" htmlFor="rental-date">
            Preferred delivery date
            <input
              id="rental-date"
              type="date"
              min={minimumDate}
              required
              {...register("date", {
                onChange: (event) => updateDelivery("date", event.target.value),
              })}
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? "rental-date-error" : undefined}
              className={`${fieldClass} min-w-0`}
            />
            <FieldError id="rental-date-error" message={errors.date?.message} />
          </label>
          <label
            className="text-base font-medium sm:col-span-2"
            htmlFor="rental-address"
          >
            Delivery address
            <textarea
              id="rental-address"
              autoComplete="street-address"
              required
              maxLength={600}
              rows={3}
              {...register("address")}
              aria-invalid={!!errors.address}
              aria-describedby={
                errors.address ? "rental-address-error" : undefined
              }
              placeholder="Street, building, and room or unit number"
              className={`${fieldClass} resize-y`}
            />
            <FieldError
              id="rental-address-error"
              message={errors.address?.message}
            />
          </label>
          <label
            className="text-base font-medium sm:col-span-2"
            htmlFor="rental-notes"
          >
            Delivery notes{" "}
            <span className="font-normal text-[#7b8471]">(optional)</span>
            <textarea
              id="rental-notes"
              maxLength={1000}
              rows={2}
              {...register("notes")}
              aria-invalid={!!errors.notes}
              aria-describedby={errors.notes ? "rental-notes-error" : undefined}
              placeholder="Anything that helps us find your place"
              className={`${fieldClass} resize-y`}
            />
            <FieldError
              id="rental-notes-error"
              message={errors.notes?.message}
            />
          </label>
        </div>
      </fieldset>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="mt-5 text-base text-red-700">
          Check the highlighted delivery details.
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#3e5736] px-5 text-base font-semibold text-white hover:bg-[#31452a]"
      >
        Review rental request <Icon name="arrow" />
      </button>
    </form>
  );
}

export function CheckoutReview({ checkout }: CheckoutFormProps) {
  const { details, edit, saveRequest, saved, errors, isSubmitting } = checkout;
  const brief = useRentalBriefStore((state) => state.brief);
  const hasMonitors = useWorkspaceStore((state) =>
    state.history.present.items.some(
      (item) => catalog[item.productId].kind === "monitor",
    ),
  );
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), [saved]);
  if (saved)
    return (
      <section
        className="rounded-3xl border border-[#e1e4da] bg-white p-5 sm:p-8"
        aria-labelledby="request-heading"
      >
        <h2
          ref={heading}
          tabIndex={-1}
          id="request-heading"
          className="text-2xl font-semibold tracking-tight focus:outline-none"
        >
          Your request is ready.
        </h2>
        <p
          role="status"
          className="mt-5 flex items-center gap-2 text-base text-[#4e6541]"
        >
          <Icon name="check" /> Your request file has been downloaded.
        </p>
        <p className="mt-4 text-base leading-relaxed text-[#6c7762]">
          No booking was sent, stock reserved, or payment taken. Your delivery
          details and rental brief have been cleared from this tab.
        </p>
        <p className="mt-6 text-base leading-relaxed text-[#3f583b]">
          Next, download your blueprint. It shows where to place each product,
          with measurements that match your setup.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/blueprint"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#3e5736] px-5 text-base font-medium text-white"
          >
            Download your blueprint <Icon name="arrow" />
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center rounded-xl border border-[#cbd4bf] px-5 text-base font-medium text-[#3f583b]"
          >
            Back to your workspace
          </Link>
        </div>
      </section>
    );
  const date = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "Asia/Makassar",
  }).format(new Date(`${details.date}T00:00:00+08:00`));
  return (
    <section
      className="rounded-3xl border border-[#e1e4da] bg-white p-5 sm:p-8"
      aria-labelledby="request-heading"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2
          ref={heading}
          tabIndex={-1}
          id="request-heading"
          className="text-2xl font-semibold tracking-tight focus:outline-none"
        >
          Your rental request
        </h2>
        <button
          type="button"
          onClick={edit}
          className="min-h-11 text-base text-[#4e6541] underline underline-offset-4"
        >
          Edit details
        </button>
      </div>
      <dl className="space-y-6 text-base">
        <div>
          <dt className="mb-1 text-[#76806c]">Contact</dt>
          <dd className="font-medium">{details.name}</dd>
          <dd className="mt-1 break-words">{details.email}</dd>
          <dd className="mt-1">{details.phone}</dd>
        </div>
        <div>
          <dt className="mb-1 text-[#76806c]">Delivery to {details.area}</dt>
          <dd className="whitespace-pre-wrap">{details.address}</dd>
        </div>
        <div>
          <dt className="mb-1 text-[#76806c]">Preferred delivery date</dt>
          <dd>{date}</dd>
        </div>
        {details.notes && (
          <div>
            <dt className="mb-1 text-[#76806c]">Delivery notes</dt>
            <dd className="whitespace-pre-wrap break-words">{details.notes}</dd>
          </div>
        )}
      </dl>
      {hasMonitors && (
        <LaptopConnectionNote
          connection={brief?.laptopConnection ?? "unsure"}
        />
      )}
      <p className="mt-8 border-t border-[#edf0e7] pt-6 text-base leading-relaxed text-[#6c7762]">
        Save a copy of your setup, estimated pricing, and delivery details to
        share. Saving this file does not send a booking or reserve equipment.
      </p>
      <button
        type="button"
        onClick={() => void saveRequest()}
        disabled={isSubmitting}
        className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#3e5736] px-5 text-base font-semibold text-white hover:bg-[#31452a]"
      >
        {isSubmitting ? "Saving request…" : "Save rental request"}{" "}
        <Icon name="box" />
      </button>
      {errors.root?.submitError && (
        <p role="alert" className="mt-4 text-base text-red-700">
          {errors.root.submitError.message}
        </p>
      )}
      {saved && (
        <p
          role="status"
          className="mt-4 flex items-center gap-2 text-base text-[#4e6541]"
        >
          <Icon name="check" /> Your request file has been downloaded.
        </p>
      )}
    </section>
  );
}
