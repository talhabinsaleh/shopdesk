"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";
import EmptyState from "@/components/shared/EmptyState";
import OrderTotals from "@/components/shared/OrderTotals";
import { refreshCart, removeFromCart, setCartQty, useCart } from "@/lib/client/cart";
import { deliveryFeeFor, FREE_DELIVERY_FROM, money } from "@/lib/shared/format";

export default function CartPage() {
  const cart = useCart();
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.qty, 0);

  useEffect(() => {
    refreshCart().then((changed) => {
      if (changed) toast.info("Some prices or stock changed, so your cart was updated.");
    });
  }, []);

  return (
    <div className="page-shell py-8 sm:py-10">
      <h1 className="section-title">Your cart</h1>
      {cart.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={ShoppingCart} title="Your cart is empty" action={<Link href="/products" className="btn btn-primary btn-sm">Browse the shop</Link>}>
            Products you add will wait here.
          </EmptyState>
        </div>
      ) : (
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
          <ul className="divide-y divide-base-300 rounded-box border border-base-300">
            {cart.map((line) => (
              <li key={line.productId} className="flex gap-3 p-3 sm:gap-4 sm:p-4">
                <Link href={`/products/${line.productId}`} className="product-tile size-20 shrink-0 rounded-field p-1.5 sm:size-24">
                  <img src={line.image} alt="" className="size-full object-contain" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/products/${line.productId}`} className="font-semibold leading-snug hover:text-primary">{line.name}</Link>
                    <p className="figure shrink-0 font-semibold">{money(line.price * line.qty)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    {line.stock === 0 ? (
                      <p className="text-sm font-medium text-error">Sold out. Please remove it.</p>
                    ) : (
                      <div className="join">
                        <button type="button" className="btn btn-xs btn-square join-item" onClick={() => setCartQty(line.productId, line.qty - 1)} aria-label={`One less ${line.name}`}><Minus className="size-3" /></button>
                        <span className="figure join-item grid w-9 place-items-center border-y border-base-300 text-sm">{line.qty}</span>
                        <button type="button" className="btn btn-xs btn-square join-item" disabled={line.qty >= line.stock} onClick={() => setCartQty(line.productId, line.qty + 1)} aria-label={`One more ${line.name}`}><Plus className="size-3" /></button>
                      </div>
                    )}
                    <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => removeFromCart(line.productId)}><Trash2 className="size-3.5" /> Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="lg:sticky lg:top-20">
            <OrderTotals subtotal={subtotal} deliveryFee={deliveryFeeFor(subtotal)}>
              {subtotal < FREE_DELIVERY_FROM && <p className="mt-3 text-xs text-base-content/70">Add <span className="figure">{money(FREE_DELIVERY_FROM - subtotal)}</span> more for free delivery.</p>}
              <Link href="/checkout" className={`btn btn-primary mt-4 w-full ${cart.some((line) => line.qty === 0) ? "btn-disabled" : ""}`}>Checkout</Link>
            </OrderTotals>
          </div>
        </div>
      )}
    </div>
  );
}
