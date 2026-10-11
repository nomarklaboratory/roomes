"use client";

import { useCallback, useState } from "react";
import { catalog } from "@/lib/catalog";
import type { Setup } from "@/types/workspace";

export function useProductRemoval(
  setup: Setup,
  onRemove: (id: string) => void,
) {
  const [requestedId, setRequestedId] = useState<string | null>(null);
  const item = setup.items.find((item) => item.id === requestedId);
  const product = item ? catalog[item.productId] : null;

  const request = useCallback(
    (id: string) => {
      if (setup.items.some((item) => item.id === id)) setRequestedId(id);
    },
    [setup.items],
  );
  const cancel = useCallback(() => setRequestedId(null), []);
  const confirm = () => {
    if (!item) return;
    setRequestedId(null);
    onRemove(item.id);
  };

  return { product, request, cancel, confirm };
}
