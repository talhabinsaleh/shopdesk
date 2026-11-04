"use client";

import { Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { money } from "@/lib/shared/format";
import type { Paged, Product } from "@/lib/shared/types";

const LIMIT = 6;

interface Props {
  className?: string;
  onDone?: () => void;
}

// Navbar search: suggestions appear while typing, Enter opens the full results on the Shop page.
// The key starts the box fresh whenever the address changes, such as "Clear filters" on the Shop page.
// Same size as the real box. Shown while a prebuilt page waits to read its address, so nothing jumps.
export function SearchBarPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="input input-sm h-9 w-full rounded-full bg-base-200">
        <Search className="size-4 opacity-60" />
        <span className="text-base-content/50">Search phones, cars, clothes...</span>
      </div>
    </div>
  );
}

export default function SearchBar(props: Props) {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = pathname === "/products" ? params.get("search") ?? "" : "";
  return <SearchBox key={`${pathname}?${current}`} initial={current} {...props} />;
}

function SearchBox({ initial, className = "", onDone }: Props & { initial: string }) {
  const router = useRouter();
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const term = query.trim();

  // Wait until typing pauses, and ignore answers to older words
  useEffect(() => {
    if (!term) return;
    let stale = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(term)}&limit=${LIMIT}`);
        const data: Paged<Product> = res.ok ? await res.json() : { items: [], total: 0, page: 1, pages: 1 };
        if (!stale) {
          setResults(data.items);
          setTotal(data.total);
          setActive(-1);
        }
      } catch {
        if (!stale) setResults([]);
      } finally {
        if (!stale) setLoading(false);
      }
    }, 250);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [term]);

  // Close the list when clicking anywhere else
  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  function finish() {
    setOpen(false);
    setActive(-1);
    onDone?.();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (active >= 0 && shown[active]) {
      router.push(`/products/${shown[active]._id}`);
    } else {
      router.push(term ? `/products?search=${encodeURIComponent(term)}` : "/products");
    }
    finish();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || shown.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index + 1) % shown.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index <= 0 ? shown.length - 1 : index - 1));
    }
  }

  const showList = open && term.length > 0;
  const shown = term ? results : [];

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form onSubmit={submit} role="search">
        <label className="input input-sm h-9 w-full rounded-full bg-base-200 focus-within:bg-base-100">
          {loading && term ? <Loader2 className="size-4 animate-spin opacity-60" /> : <Search className="size-4 opacity-60" />}
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setLoading(event.target.value.trim().length > 0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search phones, cars, clothes..."
            aria-label="Search the shop"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            enterKeyHint="search"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setLoading(false); setOpen(false); }} className="opacity-60 hover:opacity-100" aria-label="Clear search">
              <X className="size-4" />
            </button>
          )}
        </label>
      </form>

      {showList && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-lg">
          {loading && shown.length === 0 ? (
            <p className="px-4 py-3 text-sm text-base-content/60">Searching...</p>
          ) : shown.length === 0 ? (
            <p className="px-4 py-3 text-sm text-base-content/60">No products match &ldquo;{term}&rdquo;</p>
          ) : (
            <>
              <ul id={listId} role="listbox" className="max-h-[22rem] overflow-y-auto py-1">
                {shown.map((product, index) => (
                  <li key={product._id} id={`${listId}-${index}`} role="option" aria-selected={index === active}>
                    <Link
                      href={`/products/${product._id}`}
                      onClick={finish}
                      onMouseEnter={() => setActive(index)}
                      className={`flex items-center gap-3 px-3 py-2 ${index === active ? "bg-base-200" : ""}`}
                    >
                      <img src={product.image} alt="" className="product-tile size-10 shrink-0 rounded-field object-contain p-1" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{product.name}</span>
                        <span className="block text-xs text-base-content/60">{product.category}</span>
                      </span>
                      <span className="figure shrink-0 text-sm font-semibold">{money(product.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/products?search=${encodeURIComponent(term)}`}
                onClick={finish}
                className="block border-t border-base-300 px-4 py-2.5 text-sm font-medium text-primary hover:bg-base-200"
              >
                See all {total} {total === 1 ? "result" : "results"}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
