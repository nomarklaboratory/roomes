"use client";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nextDeliveryDate, rentalRequest } from "@/lib/checkout";
import { checkoutSchema } from "@/lib/form-schemas";
import type { Setup } from "@/types/workspace";
import type { DeliveryDetails } from "@/types/checkout";
import type { CheckoutFormInput, CheckoutFormOutput } from "@/types/forms";
import { useRentalBriefStore } from "@/components/studio-provider";

const emptyDetails: DeliveryDetails = {
  name: "",
  email: "",
  phone: "",
  area: "",
  address: "",
  date: "",
  notes: "",
};

export function useCheckout(setup: Setup) {
  const brief = useRentalBriefStore((state) => state.brief);
  const updateDelivery = useRentalBriefStore((state) => state.updateDelivery);
  const clearBrief = useRentalBriefStore((state) => state.clear);
  const [defaults] = useState(() => ({
    ...emptyDetails,
    area: brief?.area ?? "",
    date: brief?.date ?? "",
  }));
  const form = useForm<CheckoutFormInput, unknown, CheckoutFormOutput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: defaults,
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });
  const draft = useWatch({ control: form.control });
  const [reviewDetails, setReviewDetails] = useState<DeliveryDetails | null>(
    null,
  );
  const [reviewing, setReviewing] = useState(false);
  const [minimumDate, setMinimumDate] = useState("");
  const [saved, setSaved] = useState(false);
  const prefilled = useRef(!!brief);
  const { reset, setFocus } = form;
  // Subscribe to dirty fields so late prefill never replaces user input.
  const { dirtyFields } = form.formState;
  useEffect(() => {
    if (!brief || prefilled.current) return;
    prefilled.current = true;
    reset(
      { ...defaults, area: brief.area, date: brief.date },
      { keepDirtyValues: true, keepErrors: true },
    );
  }, [brief, reset, dirtyFields, defaults]);
  useEffect(() => {
    queueMicrotask(() => setMinimumDate(nextDeliveryDate()));
  }, []);
  const errors = form.formState.errors;
  const invalid = (fields: FieldErrors<CheckoutFormInput>) => {
    setMinimumDate(nextDeliveryDate());
    setReviewing(false);
    if (reviewing) {
      const first = Object.keys(fields)[0] as keyof CheckoutFormInput;
      requestAnimationFrame(() => setFocus(first));
    }
  };
  const review = form.handleSubmit((details) => {
    setReviewDetails(details);
    setReviewing(true);
    setSaved(false);
  }, invalid);
  const saveRequest = form.handleSubmit(async (details) => {
    try {
      const blob = new Blob(
        [JSON.stringify(rentalRequest(setup, details, brief), null, 2)],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      try {
        const link = document.createElement("a");
        link.href = url;
        link.download = "monis-rental-request.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setSaved(true);
      reset(emptyDetails);
      clearBrief();
    } catch {
      form.setError("root.submitError", {
        message:
          "Could not download your request. Your details are still here; please try again.",
      });
    }
  }, invalid);
  return {
    details: reviewDetails ?? { ...defaults, ...draft },
    register: form.register,
    errors,
    isSubmitting: form.formState.isSubmitting,
    updateDelivery,
    reviewing,
    edit: () => {
      setReviewing(false);
      setSaved(false);
    },
    review,
    minimumDate,
    saveRequest,
    saved,
  };
}
