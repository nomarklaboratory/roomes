"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { Product } from "@/types/catalog";
import { Icon } from "./icon";

export function DeleteProductDialog({
  product,
  container,
  onCancel,
  onConfirm,
  onReturnToPreview,
}: {
  product: Product | null;
  container: HTMLElement | null;
  onCancel: () => void;
  onConfirm: () => void;
  onReturnToPreview: () => void;
}) {
  return (
    <AlertDialog.Root
      open={product !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialog.Portal container={container}>
        <AlertDialog.Overlay className="fixed inset-0 z-[200] bg-[#182018]/55 backdrop-blur-sm" />
        <AlertDialog.Content
          data-product-delete-dialog
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            onReturnToPreview();
          }}
          className="fixed left-1/2 top-1/2 z-[201] w-[calc(100vw_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200 bg-[#fdfcf9] p-6 text-base text-[#293329] shadow-2xl outline-none"
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-[#f8e5de] text-[#984b3d]">
            <Icon name="trash" size={24} />
          </div>
          <AlertDialog.Title className="text-xl font-semibold">
            Delete {product?.name}?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-3 text-base leading-relaxed text-stone-600">
            This removes the item from your room. You can add it again from the
            catalog.
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel className="min-h-11 rounded-lg border border-stone-300 bg-white px-4 text-base font-medium hover:bg-stone-100">
              Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={onConfirm}
              className="flex min-h-11 items-center gap-2 rounded-lg bg-[#984b3d] px-4 text-base font-medium text-white hover:bg-[#7f3f34]"
            >
              <Icon name="trash" size={18} /> Delete item
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
