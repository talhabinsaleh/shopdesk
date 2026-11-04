"use client";

import { Banknote, ShoppingCart, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import EmptyState from "@/components/shared/EmptyState";
import OrderTotals from "@/components/shared/OrderTotals";
import { api, errorMessage } from "@/lib/client/api";
import { useSession } from "@/lib/client/auth-client";
import { clearCart, refreshCart, useCart } from "@/lib/client/cart";
import { deliveryFeeFor, money } from "@/lib/shared/format";

const METHODS = [
  { name: "bKash", icon: Smartphone },
  { name: "Nagad", icon: Smartphone },
  { name: "Cash on Delivery", icon: Banknote },
];

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const { data: session } = useSession();
  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [method, setMethod] = useState("bKash");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(false);
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.qty, 0);
  const total = subtotal + deliveryFeeFor(subtotal);
  const soldOut = cart.some((line) => line.qty === 0);
  const online = method !== "Cash on Delivery";

  useEffect(() => {
    refreshCart().then((changed) => {
      if (changed) toast.info("Some prices or stock changed, so your cart was updated. Please check the total.");
    });
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const order = await api<{ _id: string; orderNo: string }>("/api/orders", {
        method: "POST",
        body: {
          items: cart.map((line) => ({ productId: line.productId, qty: line.qty })),
          delivery: { name: name ?? session?.user.name ?? "", phone, address, city },
          payment: { method, senderNumber, transactionId },
        },
      });
      setPlaced(true);
      clearCart();
      toast.success(`Order ${order.orderNo} placed.`);
      router.push(`/orders/${order._id}`);
    } catch (err) {
      toast.error(errorMessage(err));
      await refreshCart();
      setBusy(false);
    }
  }

  if (placed) return <div className="page-shell grid min-h-[50vh] place-items-center"><span className="loading loading-spinner" aria-label="Opening your order" /></div>;

  if (cart.length === 0) {
    return (
      <div className="page-shell py-10">
        <EmptyState icon={ShoppingCart} title="Your cart is empty" action={<Link href="/products" className="btn btn-primary btn-sm">Browse the shop</Link>}>
          Add a product before checking out.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="page-shell py-8 sm:py-10">
      <h1 className="section-title">Checkout</h1>
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
        <form id="checkout" onSubmit={submit} className="space-y-6 rounded-box border border-base-300 p-4 sm:p-6">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Delivery details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Full name</span>
                <input required maxLength={80} autoComplete="name" value={name ?? session?.user.name ?? ""} onChange={(event) => setName(event.target.value)} className="input w-full" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Phone</span>
                <input required type="tel" maxLength={20} autoComplete="tel" placeholder="01712345678" value={phone} onChange={(event) => setPhone(event.target.value)} className="input w-full" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Address</span>
              <input required maxLength={300} autoComplete="street-address" placeholder="House, road and area" value={address} onChange={(event) => setAddress(event.target.value)} className="input w-full" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">City</span>
              <input required maxLength={60} autoComplete="address-level2" value={city} onChange={(event) => setCity(event.target.value)} className="input w-full" />
            </label>
          </section>

          <fieldset className="space-y-3">
            <legend className="text-lg font-semibold">Payment</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {METHODS.map(({ name: label, icon: Icon }) => (
                <label key={label} className={`flex cursor-pointer items-center gap-2 rounded-field border p-3 text-sm font-medium ${method === label ? "border-primary bg-primary/10" : "border-base-300"}`}>
                  <input type="radio" name="payment" value={label} checked={method === label} onChange={() => setMethod(label)} className="radio radio-primary radio-xs" />
                  <Icon className="size-4 shrink-0" /> {label}
                </label>
              ))}
            </div>
            {online ? (
              <div className="space-y-3 rounded-field bg-base-200 p-3">
                <p className="text-sm">Send <span className="figure font-semibold">{money(total)}</span> to the shop&apos;s {method} number <span className="figure font-semibold">017XX-XXXXXX</span>, then enter the details below. We confirm your order after checking the payment.</p>
                <p className="text-xs text-base-content/65">Demo shop: this is a sample number, so please do not send real money. Any valid-looking details will work.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Your {method} number</span>
                    <input required type="tel" maxLength={20} placeholder="01712345678" value={senderNumber} onChange={(event) => setSenderNumber(event.target.value)} className="input w-full" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Transaction ID</span>
                    <input required minLength={6} maxLength={20} value={transactionId} onChange={(event) => setTransactionId(event.target.value)} className="input w-full uppercase" />
                  </label>
                </div>
              </div>
            ) : (
              <p className="rounded-field bg-base-200 p-3 text-sm">Pay the delivery person when your order arrives.</p>
            )}
          </fieldset>
        </form>

        <div className="lg:sticky lg:top-20">
          <OrderTotals subtotal={subtotal} deliveryFee={deliveryFeeFor(subtotal)}>
            <ul className="receipt-rule mt-4 space-y-1.5 pt-3 text-xs text-base-content/75">
              {cart.map((line) => (
                <li key={line.productId} className="flex justify-between gap-3"><span>{line.qty} × {line.name}</span><span className="figure shrink-0">{money(line.price * line.qty)}</span></li>
              ))}
            </ul>
            {soldOut && <p role="alert" className="mt-3 text-sm text-error">A product in your cart has sold out. <Link href="/cart" className="underline">Update your cart</Link> to continue.</p>}
            <button form="checkout" className="btn btn-primary mt-4 w-full" disabled={busy || soldOut}>{busy && <span className="loading loading-spinner loading-xs" />} Place order</button>
          </OrderTotals>
        </div>
      </div>
    </div>
  );
}
