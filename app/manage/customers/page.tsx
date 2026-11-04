"use client";

import { useState } from "react";
import Avatar from "@/components/client/Avatar";
import { ErrorNote, PageHeader, Pager, SearchBox, Table, TableSkeleton } from "@/components/client/manage/ui";
import { formatDate, money } from "@/lib/shared/format";
import type { CustomerRow, Paged } from "@/lib/shared/types";
import { useData } from "@/lib/client/use-data";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = new URLSearchParams({ page: String(page), ...(search && { search }) });
  const { data, error, loading } = useData<Paged<CustomerRow>>(`/api/manage/customers?${query}`);

  return (
    <div className="space-y-4">
      <PageHeader title="Customers" text={data ? `${data.total} customers` : undefined} />
      <SearchBox label="Search name or email" onSearch={(value) => { setSearch(value); setPage(1); }} />
      {loading && <TableSkeleton />}
      {error && <ErrorNote message={error} />}
      {data && (
        <>
          <Table>
            <thead><tr><th>Customer</th><th className="text-right">Orders</th><th className="text-right">Total spent</th><th>Last order</th></tr></thead>
            <tbody>
              {data.items.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="flex min-w-52 items-center gap-3">
                      <Avatar name={user.name} src={user.image} className="size-8 text-xs" />
                      <span className="min-w-0"><span className="block font-medium">{user.name}</span><span className="block truncate text-xs text-base-content/60">{user.email}</span></span>
                    </div>
                  </td>
                  <td className="figure text-right">{user.orderCount}</td>
                  <td className="figure text-right font-medium">{money(user.spent)}</td>
                  <td className="whitespace-nowrap text-base-content/70">{user.lastOrder ? formatDate(user.lastOrder) : "None"}</td>
                </tr>
              ))}
              {data.items.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-base-content/70">No customers match.</td></tr>}
            </tbody>
          </Table>
          <Pager page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
