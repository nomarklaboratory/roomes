import { dimensionLabel, scaleLabel, type Product } from "@/lib/catalog";

export function ProductDimensions({ product }: { product: Product }) {
  return (
    <span
      className="block text-base leading-relaxed text-stone-600"
      title={`${product.scale.model ?? product.name}. ${product.scale.note}`}
    >
      <span className="block">{dimensionLabel(product)} · W × D × H</span>
      <span className="block">{scaleLabel(product)}</span>
    </span>
  );
}

export function ProductScaleDetails({ product }: { product: Product }) {
  return (
    <details className="mt-2 rounded-lg border border-stone-200 bg-white/60 p-3 text-base leading-relaxed text-stone-600">
      <summary className="cursor-pointer font-medium text-stone-700">
        Dimensions &amp; source · {product.name}
      </summary>
      <div className="mt-2 space-y-2">
        <ProductDimensions product={product} />
        {product.scale.model && <p>{product.scale.model}</p>}
        <p>{product.scale.note}</p>
        {product.scale.source && (
          <a
            className="underline underline-offset-2"
            href={product.scale.source}
            target="_blank"
            rel="noreferrer"
          >
            View dimension source · checked {product.scale.checkedAt}
          </a>
        )}
      </div>
    </details>
  );
}
