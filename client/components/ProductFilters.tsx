"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Category } from "@/lib/types";

export default function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    // Any new filter starts again from the first page
    next.delete("page");
    router.push(`${pathname}?${next}`);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    update({ search: search.trim() });
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-box border border-base-300 bg-base-200 p-3 sm:grid-cols-[1fr_auto] lg:grid-cols-[1fr_13rem_13rem_auto]">
      <label className="input w-full sm:col-span-2 lg:col-span-1">
        <Search className="size-4 opacity-60" />
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" aria-label="Search products" />
      </label>
      <select aria-label="Category" value={params.get("category") ?? ""} onChange={(event) => update({ category: event.target.value })} className="select w-full">
        <option value="">All categories</option>
        {categories.map((category) => <option key={category._id} value={category.name}>{category.name}</option>)}
      </select>
      <select aria-label="Sort by" value={params.get("sort") ?? "newest"} onChange={(event) => update({ sort: event.target.value === "newest" ? "" : event.target.value })} className="select w-full">
        <option value="newest">Newest first</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
      <button className="btn btn-primary">Apply</button>
    </form>
  );
}
