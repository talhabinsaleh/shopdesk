"use client";

import { Banknote, Clock, Repeat, Smartphone, Users } from "lucide-react";
import Link from "next/link";
import { ErrorNote, PageHeader, StatCard, TableSkeleton } from "@/components/manage/ui";
import SalesChart from "@/components/manage/SalesChart";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime, money } from "@/lib/format";
import type { Overview } from "@/lib/types";
import { useData } from "@/lib/use-data";

export default function OverviewPage() {
  const { data, error, loading } = useData<Overview>("/api/manage/overview");

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" text="What needs attention in the shop today." />
      {loading && <TableSkeleton />}
      {error && <ErrorNote message={error} />}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <StatCard label="Sales today" value={money(data.salesToday)} icon={Banknote} />
            <StatCard label="New orders" value={data.pending} icon={Clock} tone={data.pending ? "warning" : undefined} />
            <StatCard label="Payments to check" value={data.payments} icon={Smartphone} tone={data.payments ? "warning" : undefined} />
            <StatCard label="Exchange requests" value={data.exchanges} icon={Repeat} tone={data.exchanges ? "warning" : undefined} />
            <StatCard label="Customers" value={data.customers} icon={Users} />
          </div>

          <SalesChart days={data.days} title="Sales, last 14 days" />

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
            <section className="min-w-0 rounded-box border border-base-300 p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold">Latest orders</h2>
                <Link href="/manage/orders" className="link link-primary text-sm">All orders</Link>
              </div>
              <ul className="mt-3 divide-y divide-base-300">
                {data.recent.map((order) => (
                  <li key={order._id}>
                    <Link href={`/manage/orders/${order._id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 hover:text-primary">
                      <span className="figure font-medium">{order.orderNo}</span>
                      <span className="min-w-0 flex-1 truncate text-sm text-base-content/70">{order.userName}, {formatDateTime(order.createdAt)}</span>
                      <StatusBadge status={order.status} />
                      <span className="figure text-sm font-medium">{money(order.total)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="min-w-0 rounded-box border border-base-300 p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold">Running low</h2>
                <Link href="/manage/products" className="link link-primary text-sm">All products</Link>
              </div>
              {data.lowStock.length === 0 ? (
                <p className="mt-3 text-sm text-base-content/70">Every product has plenty of stock.</p>
              ) : (
                <ul className="mt-3 divide-y divide-base-300">
                  {data.lowStock.map((product) => (
                    <li key={product._id}>
                      <Link href={`/manage/products/${product._id}`} className="flex items-center gap-3 py-2 hover:text-primary">
                        <span className="product-tile size-10 shrink-0 rounded-field p-1"><img src={product.image} alt="" className="size-full object-contain" /></span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">{product.name}</span>
                        <span className={`figure text-sm font-semibold ${product.stock === 0 ? "text-error" : "text-warning"}`}>{product.stock === 0 ? "Sold out" : `${product.stock} left`}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
