import Link from "next/link";
import { money } from "@/lib/shared/format";
import type { Product } from "@/lib/shared/types";
import AddToCartButton from "@/components/client/AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock === 0;
  return (
    <article className="group flex flex-col overflow-hidden rounded-box border border-base-300 bg-base-100 transition-colors hover:border-primary/50">
      <Link href={`/products/${product._id}`} className="product-tile relative block aspect-square">
        <img src={product.image} alt={product.name} loading="lazy" className={`size-full object-contain p-4 transition-transform duration-300 group-hover:scale-105 ${soldOut ? "opacity-50" : ""}`} />
        {soldOut && <span className="badge badge-neutral badge-sm absolute left-2 top-2">Sold out</span>}
        {!soldOut && product.stock <= 3 && <span className="badge badge-sm absolute left-2 top-2 border-0 bg-accent text-accent-content">Only {product.stock} left</span>}
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-xs text-base-content/60">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 font-sans text-sm font-semibold leading-snug tracking-normal sm:text-base">
          <Link href={`/products/${product._id}`} className="hover:text-primary">{product.name}</Link>
        </h3>
        <div className="mt-auto pt-3">
          <p className="figure font-semibold sm:text-lg">{money(product.price)}</p>
          <AddToCartButton product={product} className="btn-sm mt-3 w-full" />
        </div>
      </div>
    </article>
  );
}
