import type { Metadata } from "next";
import OrderDetail from "@/components/OrderDetail";

export const metadata: Metadata = { title: "Order" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="page-shell py-8 sm:py-10">
      <OrderDetail id={(await params).id} />
    </div>
  );
}
