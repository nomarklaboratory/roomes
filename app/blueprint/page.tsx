import type { Metadata } from "next";
import { Blueprint } from "@/components/blueprint";

export const metadata: Metadata = {
  title: "Your setup blueprint — monis.rent",
};
export default function BlueprintPage() {
  return <Blueprint />;
}
