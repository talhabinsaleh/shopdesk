import { CheckCircle2, CircleDot, Clock, Truck, XCircle, type LucideIcon } from "lucide-react";
import type { OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, { icon: LucideIcon; className: string }> = {
  Pending: { icon: Clock, className: "text-warning border-warning/40" },
  Confirmed: { icon: CircleDot, className: "text-info border-info/40" },
  Shipped: { icon: Truck, className: "text-info border-info/40" },
  Delivered: { icon: CheckCircle2, className: "text-success border-success/40" },
  Cancelled: { icon: XCircle, className: "text-error border-error/40" },
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const { icon: Icon, className } = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>
      <Icon className="size-3.5" /> {status}
    </span>
  );
}
