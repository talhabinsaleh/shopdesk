"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/types";
import AddToCartButton from "./AddToCartButton";

export default function BuyBox({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  if (product.stock === 0) return <AddToCartButton product={product} className="w-full sm:w-auto" />;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="join">
        <button type="button" className="btn btn-square join-item" onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="One less"><Minus className="size-4" /></button>
        <span className="figure join-item grid w-12 place-items-center border-y border-base-300" aria-live="polite">{qty}</span>
        <button type="button" className="btn btn-square join-item" onClick={() => setQty((value) => Math.min(product.stock, value + 1))} aria-label="One more"><Plus className="size-4" /></button>
      </div>
      <AddToCartButton product={product} qty={qty} className="flex-1 sm:flex-none" />
    </div>
  );
}
