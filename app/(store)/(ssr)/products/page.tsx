import { PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import EmptyState from "@/components/shared/EmptyState";
import ProductCard from "@/components/server/ProductCard";
import ProductFilters from "@/components/client/ProductFilters";
import { getCategories, getProducts } from "@/lib/server/page-data";

export const metadata: Metadata = { title: "Shop" };

type Search = Record<string, string | string[] | undefined>;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string" && value) params.set(key, value);
  }
  const [categories, result] = await Promise.all([getCategories(), getProducts(params.toString())]);

  function pageHref(page: number) {
    const next = new URLSearchParams(params);
    next.set("page", String(page));
    return `/products?${next}`;
  }

  return (
    <div className="page-shell py-8 sm:py-10">
      <h1 className="section-title">{params.get("category") ?? "All products"}</h1>
      <p className="mt-1 text-sm text-base-content/70">{result.total} {result.total === 1 ? "product" : "products"}</p>

      <div className="mt-6">
        {/* key resets the typed values when the address changes, such as following a category link */}
        <Suspense><ProductFilters key={params.toString()} categories={categories} /></Suspense>
      </div>

      {result.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={PackageSearch} title="Nothing matches those filters" action={<Link href="/products" className="btn btn-outline btn-sm">Clear filters</Link>}>
            Try a different word or another category.
          </EmptyState>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {result.items.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      )}

      {result.pages > 1 && (
        <nav className="mt-8 flex flex-wrap justify-center gap-1" aria-label="Pages">
          {Array.from({ length: result.pages }, (_, index) => index + 1).map((page) => (
            <Link key={page} href={pageHref(page)} aria-current={page === result.page ? "page" : undefined} className={`btn btn-sm btn-square ${page === result.page ? "btn-primary" : "btn-ghost"}`}>{page}</Link>
          ))}
        </nav>
      )}
    </div>
  );
}
