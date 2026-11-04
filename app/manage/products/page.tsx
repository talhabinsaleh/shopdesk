"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "@/components/client/ConfirmModal";
import { ErrorNote, PageHeader, Pager, SearchBox, Table, TableSkeleton } from "@/components/client/manage/ui";
import { api, errorMessage } from "@/lib/client/api";
import { money } from "@/lib/shared/format";
import type { Paged, Product } from "@/lib/shared/types";
import { useData } from "@/lib/client/use-data";

export default function ManageProductsPage() {
  const [search, setSearch] = useState("");
  const [stock, setStock] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const query = new URLSearchParams({ page: String(page), ...(search && { search }), ...(stock && { stock }) });
  const { data, error, loading, reload } = useData<Paged<Product>>(`/api/manage/products?${query}`);

  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api(`/api/manage/products/${deleting._id}`, { method: "DELETE" });
      toast.success("Product deleted.");
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Products" text={data ? `${data.total} products` : undefined} action={<Link href="/manage/products/new" className="btn btn-primary btn-sm"><Plus className="size-4" /> Add product</Link>} />
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox label="Search products" onSearch={(value) => { setSearch(value); setPage(1); }} />
        <select aria-label="Filter by stock" value={stock} onChange={(event) => { setStock(event.target.value); setPage(1); }} className="select select-sm w-auto">
          <option value="">All stock levels</option>
          <option value="low">Running low</option>
        </select>
      </div>
      {loading && <TableSkeleton />}
      {error && <ErrorNote message={error} />}
      {data && (
        <>
          <Table>
            <thead><tr><th>Product</th><th>Category</th><th className="text-right">Price</th><th className="text-right">Stock</th><th /></tr></thead>
            <tbody>
              {data.items.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="flex min-w-52 items-center gap-3">
                      <span className="product-tile size-9 shrink-0 rounded-field p-0.5"><img src={product.image} alt="" className="size-full object-contain" /></span>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap">{product.category}</td>
                  <td className="figure text-right">{money(product.price)}</td>
                  <td className={`figure text-right font-semibold ${product.stock === 0 ? "text-error" : ""}`}>{product.stock}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <Link href={`/manage/products/${product._id}`} className="btn btn-ghost btn-xs btn-square" aria-label={`Edit ${product.name}`}><Pencil className="size-3.5" /></Link>
                      <button type="button" className="btn btn-ghost btn-xs btn-square text-error" onClick={() => setDeleting(product)} aria-label={`Delete ${product.name}`}><Trash2 className="size-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-base-content/70">No products match.</td></tr>}
            </tbody>
          </Table>
          <Pager page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
      <ConfirmModal open={Boolean(deleting)} title={`Delete ${deleting?.name}?`} confirmLabel="Delete product" busy={busy} onClose={() => setDeleting(null)} onConfirm={remove}>
        It leaves the shop. Past orders keep their copy of the product.
      </ConfirmModal>
    </div>
  );
}
