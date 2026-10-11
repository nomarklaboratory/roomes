import { catalog } from "./catalog.ts";
import type { Setup } from "../types/workspace.ts";
import type { Finish, Product, ProductMedia } from "../types/catalog.ts";

const imageLabels = {
  photo: "Product photograph",
  render: "Manufacturer render",
  catalog: "Manufacturer image",
};

export function inspectionMediaLabel(media: ProductMedia) {
  if (media.kind === "video") return "Recorded product film";
  return imageLabels[media.presentation];
}

export function inspectionTargets(setup: Setup) {
  const counts = new Map<string, number>();
  const ordinals = new Map<string, number>();
  for (const item of setup.items)
    counts.set(item.productId, (counts.get(item.productId) ?? 0) + 1);
  return [
    {
      id: "desk",
      product: catalog[setup.deskId],
      label: catalog[setup.deskId].name,
    },
    {
      id: "chair",
      product: catalog[setup.chairId],
      label: catalog[setup.chairId].name,
    },
    ...setup.items.map((item) => {
      const product = catalog[item.productId];
      const ordinal = (ordinals.get(item.productId) ?? 0) + 1;
      ordinals.set(item.productId, ordinal);
      return {
        id: item.id,
        product,
        label:
          counts.get(item.productId)! > 1
            ? `${product.name} · ${ordinal}`
            : product.name,
      };
    }),
  ];
}
export function inspectionMedia(product: Product, finish?: Finish) {
  return product.media.filter(
    (media) => !media.finish || !finish || media.finish === finish,
  );
}
