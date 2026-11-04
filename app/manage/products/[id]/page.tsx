"use client";

import { use } from "react";
import ProductForm from "@/components/client/manage/ProductForm";
import { ErrorNote, PageHeader, TableSkeleton } from "@/components/client/manage/ui";
import type { Product } from "@/lib/shared/types";
import { useData } from "@/lib/client/use-data";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading } = useData<Product>(`/api/products/${id}`);
  return (
    <div className="space-y-5">
      <PageHeader title="Edit product" />
      {loading && <TableSkeleton />}
      {error && <ErrorNote message={error} />}
      {data && <ProductForm product={data} />}
    </div>
  );
}
