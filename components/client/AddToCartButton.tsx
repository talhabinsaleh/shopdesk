"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { addToCart, useCart } from "@/lib/client/cart";
import type { Product } from "@/lib/shared/types";

interface Props {
  product: Pick<Product, "_id" | "name" | "image" | "price" | "stock">;
  qty?: number;
  className?: string;
}

export default function AddToCartButton({ product, qty = 1, className = "" }: Props) {
  const cart = useCart();
  const inCart = cart.find((line) => line.productId === product._id)?.qty ?? 0;
  const atLimit = inCart >= product.stock;

  function add() {
    addToCart(product, qty);
    toast.success(`${product.name} added to your cart.`);
  }

  if (product.stock === 0) return <button type="button" disabled className={`btn ${className}`}>Sold out</button>;
  return (
    <button type="button" onClick={add} disabled={atLimit} className={`btn btn-primary ${className}`}>
      <ShoppingCart className="size-4" /> {atLimit ? "All in your cart" : "Add to cart"}
    </button>
  );
}
