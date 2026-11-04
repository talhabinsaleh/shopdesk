"use client";

import { PackageSearch } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, money } from "@/lib/format";
import type { Order } from "@/lib/types";
import { useData } from "@/lib/use-data";

export default function MyOrdersPage() {
  const { data: orders, error, loading } = useData<Order[]>("/api/orders/mine");

  return (
    <div className="page-shell py-8 sm:py-10">
      <h1 className="section-title">My Orders</h1>
      <div className="mt-6">
        {loading && <div className="space-y-3">{[1, 2, 3].map((row) => <div key={row} className="skeleton h-24 w-full" />)}</div>}
        {error && <p role="alert" className="text-error">{error}</p>}
        {orders?.length === 0 && (
          <EmptyState icon={PackageSearch} title="No orders yet" action={<Link href="/products" className="btn btn-primary btn-sm">Browse the shop</Link>}>
            Orders you place will appear here so you can track them.
          </EmptyState>
        )}
        <ul className="space-y-3">
          {orders?.map((order) => (
            <li key={order._id}>
              <Link href={`/orders/${order._id}`} className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-box border border-base-300 p-4 transition-colors hover:border-primary/50">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 3).map((item) => (
                    <span key={item.productId} className="product-tile size-12 rounded-full border-2 border-base-100 p-1"><img src={item.image} alt="" className="size-full object-contain" /></span>
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="figure font-semibold">{order.orderNo}</p>
                  <p className="text-sm text-base-content/70">{formatDate(order.createdAt)}, {order.items.length} {order.items.length === 1 ? "product" : "products"}</p>
                </div>
                <StatusBadge status={order.status} />
                <p className="figure font-semibold">{money(order.total)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
