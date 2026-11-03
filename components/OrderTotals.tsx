import type { ReactNode } from "react";
import { money } from "@/lib/format";

// Totals are styled as a till receipt, the site's signature detail
export default function OrderTotals({ subtotal, deliveryFee, children }: { subtotal: number; deliveryFee: number; children?: ReactNode }) {
  return (
    <div className="receipt rounded-t-box p-5">
      <h2 className="text-lg font-semibold">Order summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd className="figure">{money(subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Delivery</dt><dd className="figure">{deliveryFee === 0 ? "Free" : money(deliveryFee)}</dd></div>
        <div className="receipt-rule flex justify-between pt-3 text-base font-semibold"><dt>Total</dt><dd className="figure">{money(subtotal + deliveryFee)}</dd></div>
      </dl>
      {children}
    </div>
  );
}
