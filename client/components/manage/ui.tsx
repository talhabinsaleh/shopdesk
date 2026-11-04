"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, ImageUp, Search, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/api";

export function PageHeader({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {text && <p className="mt-1 text-sm text-base-content/70">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, note, icon: Icon, tone, href }: { label: string; value: ReactNode; note?: string; icon: LucideIcon; tone?: "warning"; href?: string }) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-base-content/70">{label}</p>
        <Icon className={`size-4 ${tone === "warning" ? "text-warning" : "text-primary"}`} />
      </div>
      <p className="figure mt-2 text-2xl font-semibold">{value}</p>
      {note && <p className="mt-1 text-xs text-base-content/60">{note}</p>}
    </>
  );
  const box = "block rounded-box border border-base-300 bg-base-100 p-4";
  // With a link, the whole card opens the matching list
  return href ? <Link href={href} className={`${box} transition-colors hover:border-primary/50 hover:bg-base-200`}>{body}</Link> : <div className={box}>{body}</div>;
}

export function Pager({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages <= 1) return null;
  return (
    <nav className="mt-4 flex items-center justify-end gap-2" aria-label="Pages">
      <button type="button" className="btn btn-outline btn-sm btn-square" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft className="size-4" /></button>
      <span className="figure text-sm">{page} / {pages}</span>
      <button type="button" className="btn btn-outline btn-sm btn-square" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight className="size-4" /></button>
    </nav>
  );
}

export function SearchBox({ label, onSearch }: { label: string; onSearch: (value: string) => void }) {
  const [value, setValue] = useState("");
  function submit(event: FormEvent) {
    event.preventDefault();
    onSearch(value.trim());
  }
  return (
    <form onSubmit={submit} className="flex-1 sm:max-w-xs" role="search">
      <label className="input input-sm w-full">
        <Search className="size-4 opacity-60" />
        <input type="search" aria-label={label} placeholder={label} value={value} onChange={(event) => setValue(event.target.value)} />
      </label>
    </form>
  );
}

// Wide tables scroll inside their own box, so the page itself never scrolls sideways
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-box border border-base-300">
      <table className="table table-sm [&_td]:align-middle [&_th]:whitespace-nowrap">{children}</table>
    </div>
  );
}

export function TableSkeleton() {
  return <div className="space-y-2">{[1, 2, 3, 4, 5].map((row) => <div key={row} className="skeleton h-11 w-full" />)}</div>;
}

export function ErrorNote({ message }: { message: string }) {
  return <p role="alert" className="rounded-field border border-error/40 p-3 text-sm text-error">{message}</p>;
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog ref={ref} className="modal" onClose={onClose}>
      <div className="modal-box border border-base-300">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="mt-4">{open && children}</div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Close dialog" onClick={onClose} />
    </dialog>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-base-content/60">{hint}</span>}
    </label>
  );
}

export function ImageField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [uploading, setUploading] = useState(false);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Upload failed. Please try again.");
      onChange(data.url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-medium">Image</span>
      <div className="flex items-center gap-3">
        <span className="product-tile grid size-16 shrink-0 place-items-center rounded-field p-1">
          {value && <img src={value} alt="" className="size-full object-contain" />}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <input required aria-label="Image link" placeholder="Paste an image link" value={value} onChange={(event) => onChange(event.target.value)} className="input input-sm w-full" />
          <label className={`btn btn-outline btn-sm ${uploading ? "btn-disabled" : ""}`}>
            {uploading ? <span className="loading loading-spinner loading-xs" /> : <ImageUp className="size-4" />}
            {uploading ? "Uploading" : "Upload image"}
            <input type="file" accept="image/*" onChange={upload} className="sr-only" disabled={uploading} />
          </label>
        </div>
      </div>
    </div>
  );
}
