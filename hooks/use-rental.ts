"use client";
import { useMemo } from "react";
import { useWorkspaceStore } from "@/components/studio-provider";
import { quote } from "@/lib/workspace";

export function useRental() {
  const setup = useWorkspaceStore((state) => state.history.present);
  const rental = useMemo(() => quote(setup), [setup]);
  return { setup, rental };
}
