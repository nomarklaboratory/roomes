import type { Metadata } from "next";
import { Checkout } from "@/components/checkout";

export const metadata: Metadata = {
  title: "Checkout — monis.rent",
  description: "Review your workspace rental and choose your delivery details.",
};

export default function CheckoutPage() {
  return <Checkout />;
}
