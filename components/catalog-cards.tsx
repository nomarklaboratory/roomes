import { A } from "@mobily/ts-belt";
import { products, money } from "@/lib/catalog";
import { canAdd } from "@/lib/workspace";
import { duplicatePlacement } from "@/lib/product-duplication";
import { cn } from "@/lib/cn";
import type { Category, Product } from "@/types/catalog";
import type { Action, Setup } from "@/types/workspace";
import { ProductPhoto } from "./product-photo";
import { ProductDimensions } from "./product-dimensions";
import { Icon } from "./icon";

const byCategory = A.groupBy(products, (product) => product.category);
type CardProps = {
  product: Product;
  setup: Setup;
  change: (action: Action) => void;
};

function FurnitureCard({ product, setup, change }: CardProps) {
  const active = setup.deskId === product.id || setup.chairId === product.id;
  const category = product.category;
  if (category === "accessory") return null;
  return (
    <button
      type="button"
      className={cn(
        "relative w-full rounded-xl border bg-[#f9f8f3] p-3 text-left transition-colors hover:border-[#a5b595]",
        active ? "border-[#a5b595] bg-[#eef2e6]" : "border-stone-200",
      )}
      aria-label={`Select ${product.name}`}
      aria-pressed={active}
      onClick={() => change({ type: category, id: product.id })}
    >
      <ProductPhoto
        product={product}
        finish={active ? setup.finish : undefined}
      />
      <span className="mt-3 block text-base tracking-wide text-stone-500">
        {product.brand}
      </span>
      <span className="mt-1 block text-base font-semibold text-stone-800">
        {product.name}
      </span>
      <span className="my-1 block text-base text-stone-500">
        {product.subtitle}
      </span>
      <ProductDimensions product={product} />
      <span className="mt-3 block text-base font-medium">
        {money(product.weeklyCents)}
        <small className="text-base font-normal text-stone-500">
          {" "}
          / week rate
        </small>
      </span>
      {active && (
        <span className="absolute right-5 top-5 rounded-full bg-[#3f583b] p-1 text-white">
          <Icon name="check" size={12} />
        </span>
      )}
    </button>
  );
}

function AccessoryCard({ product, setup, change }: CardProps) {
  const added = setup.items.filter((item) => item.productId === product.id);
  const canAddNew = canAdd(setup, product.id);
  const copy = added[0];
  const available =
    canAddNew || (copy && duplicatePlacement(setup, copy.id) !== null);
  const remove = () => {
    const item = added.at(-1);
    if (item) change({ type: "remove", id: item.id });
  };
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3",
        added.length > 0
          ? "border-[#a5b595] bg-[#eef2e6]"
          : "border-stone-200 bg-[#f9f8f3]",
      )}
    >
      <ProductPhoto product={product} compact />
      <div className="min-w-0 flex-1">
        <p className="text-base text-stone-500">{product.brand}</p>
        <p className="text-base font-semibold">{product.name}</p>
        <p className="my-1 text-base text-stone-500">{product.subtitle}</p>
        <ProductDimensions product={product} />
        <p className="mt-2 text-base">
          {money(product.weeklyCents)}
          <small className="text-base text-stone-500"> / week</small>
        </p>
        {!available && !added.length && product.kind === "monitor" && (
          <p className="mt-1 text-base text-stone-500">
            Choose a wider desk to add
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        {added.length > 0 && (
          <>
            <button
              type="button"
              onClick={remove}
              aria-label={`Remove one ${product.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 bg-white"
            >
              <Icon name="minus" size={14} />
            </button>
            <span className="text-base" aria-label={`${added.length} added`}>
              {added.length}
            </span>
          </>
        )}
        <button
          type="button"
          disabled={!available}
          aria-label={`Add ${product.name}`}
          onClick={() => {
            if (canAddNew)
              change({
                type: "add",
                productId: product.id,
                id: crypto.randomUUID(),
              });
            else if (copy)
              change({
                type: "duplicate",
                id: copy.id,
                newId: crypto.randomUUID(),
              });
          }}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#a5b595] bg-white text-[#3f583b] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="plus" size={17} />
        </button>
      </div>
    </div>
  );
}

export function CatalogCards({
  category,
  setup,
  change,
  columns = false,
}: {
  category: Category;
  setup: Setup;
  change: (action: Action) => void;
  columns?: boolean;
}) {
  const Card = category === "accessory" ? AccessoryCard : FurnitureCard;
  return (
    <div className={cn("grid gap-3", columns && "min-[850px]:grid-cols-2")}>
      {(byCategory[category] ?? []).map((product) => (
        <Card
          key={product.id}
          product={product}
          setup={setup}
          change={change}
        />
      ))}
    </div>
  );
}
