"use client";

import { Check, ChevronLeft, Printer, Repeat } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/api";
import { formatDateTime, money } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { useData } from "@/lib/use-data";
import ConfirmModal from "@/components/ConfirmModal";
import { Modal } from "@/components/manage/ui";
import OrderTotals from "@/components/OrderTotals";
import StatusBadge from "@/components/StatusBadge";

const STEPS: OrderStatus[] = ["Pending", "Confirmed", "Shipped", "Delivered"];
const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  Pending: { status: "Confirmed", label: "Confirm order" },
  Confirmed: { status: "Shipped", label: "Mark as shipped" },
  Shipped: { status: "Delivered", label: "Mark as delivered" },
};
const EXCHANGE_DAYS = 7;

// One view for both sides: customers track, cancel and exchange, the admin moves the order along
export default function OrderDetail({ id, manage = false }: { id: string; manage?: boolean }) {
  const { data: order, error, loading, reload } = useData<Order>(`/api/orders/${id}`);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [reason, setReason] = useState("");
  // Read once when the page opens, so the exchange button does not change while rendering
  const [openedAt] = useState(() => Date.now());

  async function send(method: "PATCH" | "POST", path: string, body: unknown, message: string) {
    setBusy(true);
    try {
      await api(`/api/orders/${id}/${path}`, { method, body });
      toast.success(message);
      setConfirmCancel(false);
      setExchangeOpen(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      reload();
      setBusy(false);
    }
  }

  function requestExchange(event: FormEvent) {
    event.preventDefault();
    send("POST", "exchange", { reason }, "Exchange requested.");
  }

  const back = manage ? "/manage/orders" : "/orders";

  if (loading) return <div className="skeleton h-96 w-full" />;
  if (error || !order) {
    return (
      <div>
        <p role="alert" className="text-error">{error || "Order not found."}</p>
        <Link href={back} className="btn btn-outline btn-sm mt-4">Back to orders</Link>
      </div>
    );
  }

  const reached = STEPS.indexOf(order.status);
  const next = NEXT[order.status];
  const canCancel = manage ? ["Pending", "Confirmed"].includes(order.status) : order.status === "Pending";
  const delivered = order.history.find((entry) => entry.status === "Delivered");
  const canExchange = !manage && Boolean(delivered) && !order.exchange && openedAt - new Date(delivered!.at).getTime() <= EXCHANGE_DAYS * 24 * 60 * 60 * 1000;
  const checkPayment = manage && order.payment.status === "Awaiting check" && order.status !== "Cancelled";

  return (
    <div>
      <Link href={back} className="no-print inline-flex items-center gap-1 text-sm text-base-content/70 hover:text-primary"><ChevronLeft className="size-4" /> Back to orders</Link>
      <p className="mb-6 hidden border-b border-base-300 pb-3 font-display text-lg font-bold print:block">ShopDesk invoice</p>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="figure text-2xl font-semibold sm:text-3xl">{order.orderNo}</h1>
          <p className="mt-1 text-sm text-base-content/70">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <button type="button" className="no-print btn btn-outline btn-sm" onClick={() => window.print()}><Printer className="size-4" /> Invoice</button>
        </div>
      </div>

      {order.status !== "Cancelled" && (
        <ol className="no-print mt-6 grid grid-cols-4 gap-1" aria-label="Order progress">
          {STEPS.map((step, index) => (
            <li key={step} aria-current={index === reached ? "step" : undefined}>
              <div className={`h-1.5 rounded-full ${index <= reached ? "bg-primary" : "bg-base-300"}`} />
              <p className={`mt-2 flex items-center gap-1 text-xs sm:text-sm ${index <= reached ? "font-medium" : "text-base-content/55"}`}>
                {index <= reached && <Check className="size-3.5 shrink-0 text-primary" />} {step}
              </p>
            </li>
          ))}
        </ol>
      )}

      {order.exchange && (
        <div className="no-print mt-6 rounded-field border border-base-300 p-3">
          <p className="flex flex-wrap items-center gap-2 font-medium"><Repeat className="size-4 text-primary" /> Exchange: {order.exchange.status}</p>
          <p className="mt-1 text-sm text-base-content/75">{order.exchange.reason}</p>
          {manage && order.exchange.status === "Requested" && (
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => send("PATCH", "exchange", { status: "Approved" }, "Exchange approved.")}>Approve</button>
              <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => send("PATCH", "exchange", { status: "Rejected" }, "Exchange rejected.")}>Reject</button>
            </div>
          )}
        </div>
      )}

      <div className="no-print mt-6 flex flex-wrap gap-2 empty:hidden">
        {checkPayment && <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => send("PATCH", "payment", {}, "Payment marked as paid.")}>Mark payment as paid</button>}
        {manage && next && <button type="button" className={`btn btn-sm ${checkPayment ? "btn-outline" : "btn-primary"}`} disabled={busy} onClick={() => send("PATCH", "status", { status: next.status }, `Order is now ${next.status}.`)}>{next.label}</button>}
        {canCancel && <button type="button" className="btn btn-outline btn-error btn-sm" disabled={busy} onClick={() => setConfirmCancel(true)}>Cancel order</button>}
        {canExchange && <button type="button" className="btn btn-outline btn-sm" onClick={() => setExchangeOpen(true)}><Repeat className="size-4" /> Request exchange</button>}
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <ul className="divide-y divide-base-300 rounded-box border border-base-300">
            {order.items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3 p-3">
                <span className="product-tile size-14 shrink-0 rounded-field p-1"><img src={item.image} alt="" className="size-full object-contain" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug">{item.name}</p>
                  <p className="figure text-sm text-base-content/70">{item.qty} × {money(item.price)}</p>
                </div>
                <p className="figure font-semibold">{money(item.price * item.qty)}</p>
              </li>
            ))}
          </ul>

          <section>
            <h2 className="font-semibold">Deliver to</h2>
            <address className="mt-2 text-sm not-italic leading-relaxed text-base-content/80">
              {order.delivery.name}<br />{order.delivery.address}<br />{order.delivery.city}<br />{order.delivery.phone}
            </address>
            {manage && <p className="mt-2 text-sm text-base-content/70">Account: {order.userEmail}</p>}
          </section>
        </div>

        <OrderTotals subtotal={order.subtotal} deliveryFee={order.deliveryFee}>
          <dl className="receipt-rule mt-4 space-y-1 pt-3 text-xs text-base-content/75">
            <div className="flex justify-between gap-3"><dt>Payment</dt><dd>{order.payment.method}</dd></div>
            <div className="flex justify-between gap-3"><dt>Status</dt><dd className="font-medium">{order.payment.status}</dd></div>
            {order.payment.transactionId && <div className="flex justify-between gap-3"><dt>Transaction ID</dt><dd className="figure">{order.payment.transactionId}</dd></div>}
            {manage && order.payment.senderNumber && <div className="flex justify-between gap-3"><dt>Paid from</dt><dd className="figure">{order.payment.senderNumber}</dd></div>}
          </dl>
        </OrderTotals>
      </div>

      <ConfirmModal
        open={confirmCancel}
        title={`Cancel ${order.orderNo}?`}
        confirmLabel="Cancel order"
        busy={busy}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => send("PATCH", manage ? "status" : "cancel", manage ? { status: "Cancelled" } : {}, "Order cancelled.")}
      >
        The products go back into stock. This cannot be undone.
      </ConfirmModal>

      <Modal open={exchangeOpen} title="Request an exchange" onClose={() => setExchangeOpen(false)}>
        <form onSubmit={requestExchange} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">What would you like to exchange, and why?</span>
            <textarea required minLength={5} maxLength={500} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} className="textarea w-full" />
          </label>
          <div className="modal-action">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setExchangeOpen(false)} disabled={busy}>Cancel</button>
            <button className="btn btn-primary btn-sm" disabled={busy}>{busy && <span className="loading loading-spinner loading-xs" />} Send request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
