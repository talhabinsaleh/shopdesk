"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import ConfirmModal from "@/components/ConfirmModal";
import { ErrorNote, Field, ImageField, Modal, PageHeader, TableSkeleton } from "@/components/manage/ui";
import { api, errorMessage } from "@/lib/api";
import type { Category } from "@/lib/types";
import { useData } from "@/lib/use-data";

function CategoryForm({ category, onDone }: { category: Category | null; onDone: (saved: boolean) => void }) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const body = { name, description, image };
      if (category) await api(`/api/manage/categories/${category._id}`, { method: "PUT", body });
      else await api("/api/manage/categories", { method: "POST", body });
      toast.success("Category saved.");
      onDone(true);
    } catch (err) {
      toast.error(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Name"><input required minLength={2} maxLength={60} value={name} onChange={(event) => setName(event.target.value)} className="input w-full" /></Field>
      <Field label="Description"><input maxLength={300} value={description} onChange={(event) => setDescription(event.target.value)} className="input w-full" /></Field>
      <ImageField value={image} onChange={setImage} />
      <div className="modal-action">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onDone(false)} disabled={busy}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={busy}>{busy && <span className="loading loading-spinner loading-xs" />} Save</button>
      </div>
    </form>
  );
}

export default function CategoriesPage() {
  const { data, error, loading, reload } = useData<Category[]>("/api/categories");
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api(`/api/manage/categories/${deleting._id}`, { method: "DELETE" });
      toast.success("Category deleted.");
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
      <PageHeader title="Categories" action={<button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing("new")}><Plus className="size-4" /> Add category</button>} />
      {loading && <TableSkeleton />}
      {error && <ErrorNote message={error} />}
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data?.map((category) => (
          <li key={category._id} className="flex items-center gap-3 rounded-box border border-base-300 p-3">
            <span className="product-tile size-16 shrink-0 rounded-field p-1"><img src={category.image} alt="" className="size-full object-contain" /></span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{category.name}</p>
              <p className="text-xs text-base-content/65">{category.productCount} products</p>
            </div>
            <button type="button" className="btn btn-ghost btn-xs btn-square" onClick={() => setEditing(category)} aria-label={`Edit ${category.name}`}><Pencil className="size-3.5" /></button>
            <button type="button" className="btn btn-ghost btn-xs btn-square text-error" onClick={() => setDeleting(category)} aria-label={`Delete ${category.name}`}><Trash2 className="size-3.5" /></button>
          </li>
        ))}
      </ul>
      <Modal open={editing !== null} title={editing === "new" ? "Add category" : "Edit category"} onClose={() => setEditing(null)}>
        {editing !== null && <CategoryForm category={editing === "new" ? null : editing} onDone={(saved) => { setEditing(null); if (saved) reload(); }} />}
      </Modal>
      <ConfirmModal open={Boolean(deleting)} title={`Delete ${deleting?.name}?`} confirmLabel="Delete category" busy={busy} onClose={() => setDeleting(null)} onConfirm={remove}>
        A category can only be deleted once it has no products.
      </ConfirmModal>
    </div>
  );
}
