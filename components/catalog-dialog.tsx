"use client";

import { finishesFor } from "@/lib/catalog";
import type { Category } from "@/types/catalog";
import type { Action } from "@/types/workspace";
import { useEditorStore, useWorkspaceStore } from "./studio-provider";
import { cn } from "@/lib/cn";
import { CatalogCards } from "./catalog-cards";
import { Icon } from "./icon";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";

const categories: {
  id: Category;
  label: string;
  icon: "desk" | "chair" | "extras";
}[] = [
  { id: "desk", label: "Desks", icon: "desk" },
  { id: "chair", label: "Chairs", icon: "chair" },
  { id: "accessory", label: "Extras", icon: "extras" },
];

const categoryCopy: Record<Category, string> = {
  desk: "Choose a desk for your room.",
  chair: "Find a chair that feels right.",
  accessory: "Add details to make the space yours.",
};

export function CatalogDialog({
  container,
  onReturnToPreview,
}: {
  container: HTMLElement | null;
  onReturnToPreview: () => void;
}) {
  const open = useEditorStore((state) => state.catalogOpen);
  const onOpenChange = useEditorStore((state) => state.setCatalogOpen);
  const category = useEditorStore((state) => state.category);
  const onCategoryChange = useEditorStore((state) => state.setCategory);
  const setSelected = useEditorStore((state) => state.setSelected);
  const setup = useWorkspaceStore((state) => state.history.present);
  const canUndo = useWorkspaceStore((state) => state.history.past.length > 0);
  const dispatch = useWorkspaceStore((state) => state.change);
  const count = setup.items.length + 2;
  const change = (action: Action) => {
    dispatch(action);
    if (action.type === "undo" || action.type === "reset") setSelected(null);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        container={container}
        data-product-catalog
        aria-describedby="catalog-description"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onReturnToPreview();
        }}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e4e6dc] px-6 py-5 max-[700px]:px-4 max-[700px]:py-4">
          <div>
            <p className="text-base font-semibold tracking-[0.12em] text-[#728163]">
              YOUR WORKSPACE
            </p>
            <DialogTitle className="mt-1">Make it yours.</DialogTitle>
            <DialogDescription id="catalog-description" className="mt-1">
              Choose furniture and extras. Your room preview updates as you go.
            </DialogDescription>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="rounded-lg border border-[#e2e6d8] bg-[#f6f6ee] px-3 py-2 text-base text-[#526346]">
              {count} items
            </span>
            <DialogClose
              aria-label="Close product catalog"
              className="flex size-11 items-center justify-center rounded-full border border-stone-200 bg-white text-2xl hover:bg-stone-100"
            >
              ×
            </DialogClose>
          </div>
        </header>

        <div className="flex shrink-0 gap-2 border-b border-[#e4e6dc] px-6 py-4 max-[700px]:px-4 max-[700px]:py-3">
          {categories.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={category === id}
              onClick={() => onCategoryChange(id)}
              className={cn(
                "flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-base text-[#59644f] hover:bg-[#edf0e6]",
                category === id && "bg-[#e1e8d7] font-medium text-[#34472c]",
              )}
            >
              <Icon name={icon} size={19} />
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 max-[700px]:px-4 max-[700px]:py-4">
          <p className="mb-4 text-base text-[#68735e]">
            {categoryCopy[category]}
          </p>
          <CatalogCards
            category={category}
            setup={setup}
            change={change}
            columns
          />
          {category === "desk" && (
            <section className="mt-6 border-t border-[#e4e6dc] pt-5">
              <h3 className="text-base font-semibold text-[#3f583b]">
                Desk finish
              </h3>
              <div className="mt-3 flex flex-wrap gap-3">
                {finishesFor(setup.deskId).map((finish) => (
                  <button
                    key={finish.id}
                    type="button"
                    onClick={() => change({ type: "finish", value: finish.id })}
                    aria-pressed={setup.finish === finish.id}
                    className={cn(
                      "flex min-h-12 items-center gap-2 rounded-lg border px-3 text-base text-[#526346] hover:bg-[#f1f3eb]",
                      setup.finish === finish.id
                        ? "border-[#53683d] bg-[#e8eedc]"
                        : "border-[#dce1d2] bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "size-6 rounded-full border border-black/10",
                        finish.swatch,
                      )}
                    />
                    {finish.name}
                  </button>
                ))}
              </div>
            </section>
          )}
          {category === "accessory" && (
            <p className="mt-4 text-base leading-relaxed text-stone-600">
              Add accessories here, then drag them in the room preview to
              reposition them.
            </p>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[#e4e6dc] px-6 py-3 max-[700px]:px-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-base text-[#34472c] hover:bg-[#edf0e6] disabled:opacity-40"
              disabled={!canUndo}
              onClick={() => change({ type: "undo" })}
            >
              <Icon name="undo" size={17} /> Undo
            </button>
            <button
              type="button"
              className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-base text-[#34472c] hover:bg-[#edf0e6]"
              onClick={() => change({ type: "reset" })}
            >
              <Icon name="reset" size={17} /> Reset setup
            </button>
          </div>
          <DialogClose className="min-h-11 rounded-lg bg-[#344c32] px-5 text-base font-medium text-white hover:bg-[#263b25]">
            Done
          </DialogClose>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
