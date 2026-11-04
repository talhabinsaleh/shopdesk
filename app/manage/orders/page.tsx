"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ErrorNote, PageHeader, Pager, SearchBox, Table, TableSkeleton } from "@/components/client/manage/ui";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDateTime, money } from "@/lib/shared/format";
import type { Order, Paged } from "@/lib/shared/types";
import { useData } from "@/lib/client/use-data";

const STATUSES = ["", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

// The same lists the cards on the Overview page link to, e.g. /manage/orders?show=payments
const SHOWS = [
  { value: "", label: "All orders" },
  { value: "new", label: "New orders" },
  { value: "payments", label: "Payments to check" },
  { value: "exchanges", label: "Exchange requests" },
];

function PaymentNote({ order }: { order: Order }) {
  const { method, status } = order.payment;
  const tone = status === "Paid" ? "text-success" : status === "Awaiting check" ? "text-warning" : "text-base-content/70";
  return <span className="whitespace-nowrap text-sm">{method}, <span className={tone}>{status.toLowerCase()}</span></span>;
}

function OrdersList() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const show = SHOWS.some((item) => item.value === params.get("show")) ? params.get("show")! : "";
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = new URLSearchParams({ page: String(page), ...(show && { show }), ...(status && { status }), ...(search && { search }) });
  const { data, error, loading } = useData<Paged<Order>>(`/api/orders/all?${query}`);

  // The quick filter lives in the address, so the back button and a shared link keep it
  function pickShow(value: string) {
    setStatus("");
    setPage(1);
    router.replace(value ? `${pathname}?show=${value}` : pathname, { scroll: false });
  }

  return (
    <div className="space-y-4">
      <PageHeader title={SHOWS.find((item) => item.value === show)!.label} text={data ? `${data.total} orders` : undefined} />
      <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
        {SHOWS.map((item) => (
          <button key={item.value} type="button" aria-pressed={show === item.value} onClick={() => pickShow(item.value)} className={`btn btn-sm ${show === item.value ? "btn-primary" : "btn-outline"}`}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox label="Search number, name or phone" onSearch={(value) => { setSearch(value); setPage(1); }} />
        {show !== "new" && (
          <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="select select-sm w-auto">
            {STATUSES.map((value) => <option key={value} value={value}>{value || "All statuses"}</option>)}
          </select>
        )}
      </div>
      {loading && <TableSkeleton />}
      {error && <ErrorNote message={error} />}
      {data && (
        <>
          <Table>
            <thead><tr><th>Order</th><th>Customer</th><th>Placed</th><th>Status</th><th>Payment</th>{show === "exchanges" && <th>Exchange reason</th>}<th className="text-right">Total</th></tr></thead>
            <tbody>
              {data.items.map((order) => (
                <tr key={order._id} className="hover:bg-base-200">
                  <td><Link href={`/manage/orders/${order._id}`} className="figure font-medium text-primary hover:underline">{order.orderNo}</Link></td>
                  <td className="whitespace-nowrap">{order.userName}<span className="block text-xs text-base-content/60">{order.delivery.phone}</span></td>
                  <td className="whitespace-nowrap text-base-content/70">{formatDateTime(order.createdAt)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td><PaymentNote order={order} /></td>
                  {show === "exchanges" && <td className="min-w-48 max-w-72 text-sm text-base-content/80">{order.exchange?.reason}</td>}
                  <td className="figure text-right font-medium">{money(order.total)}</td>
                </tr>
              ))}
              {data.items.length === 0 && <tr><td colSpan={show === "exchanges" ? 7 : 6} className="py-8 text-center text-base-content/70">No orders match.</td></tr>}
            </tbody>
          </Table>
          <Pager page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

// useSearchParams needs a Suspense boundary so the page can still build
export default function ManageOrdersPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <OrdersList />
    </Suspense>
  );
}
