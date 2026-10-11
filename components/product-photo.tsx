import Image from "next/image";
import { cn } from "@/lib/cn";
import { productHero } from "@/lib/catalog";
import type { Finish, Product } from "@/types/catalog";

export function ProductPhoto({
  product,
  compact = false,
  finish,
}: {
  product: Product;
  compact?: boolean;
  finish?: Finish;
}) {
  const media = productHero(product, finish);
  if (!media)
    return <span className="text-base text-stone-500">Photo unavailable</span>;
  return (
    <div
      className={cn(
        "relative flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white",
        compact && "h-20 w-20",
      )}
      data-product-photo
    >
      <Image
        src={media.src}
        alt={product.name}
        fill
        sizes={compact ? "80px" : "(min-width: 1024px) 320px, 90vw"}
        className="object-contain"
      />
    </div>
  );
}
