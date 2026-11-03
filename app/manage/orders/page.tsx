"use client";

import Link from "next/link";
import { useState } from "react";
import { ErrorNote, PageHeader, Pager, SearchBox, Table, TableSkeleton } from "@/components/manage/ui";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime, money } from "@/lib/format";
import type { Order, Paged } from "@/lib/types";
import { useData } from "@/lib/use-data";

const STATUSES = ["", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export default function ManageOrdersPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = new URLSearchParams({ page: String(page), ...(status && { status }), ...(search && { search }) });
  const { data, error, loading } = useData<Paged<Order>>(`/api/orders/all?${query}`);

  return (
    <div className="space-y-4">
      <PageHeader title="Orders" text={data ? `${data.total} orders` : undefined} />
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox label="Search number, name or phone" onSearch={(value) => { setSearch(value); setPage(1); }} />
        <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="select select-sm w-auto">
          {STATUSES.map((value) => <option key={value} value={value}>{value || "All statuses"}</option>)}
        </select>
      </div>
      {loading && <TableSkeleton />}
      {error && <ErrorNote message={error} />}
      {data && (
        <>
          <Table>
            <thead><tr><th>Order</th><th>Customer</th><th>Placed</th><th>Status</th><th className="text-right">Total</th></tr></thead>
            <tbody>
              {data.items.map((order) => (
                <tr key={order._id} className="hover:bg-base-200">
                  <td><Link href={`/manage/orders/${order._id}`} className="figure font-medium text-primary hover:underline">{order.orderNo}</Link></td>
                  <td className="whitespace-nowrap">{order.userName}</td>
                  <td className="whitespace-nowrap text-base-content/70">{formatDateTime(order.createdAt)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className="figure text-right font-medium">{money(order.total)}</td>
                </tr>
              ))}
              {data.items.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-base-content/70">No orders match.</td></tr>}
            </tbody>
          </Table>
          <Pager page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
