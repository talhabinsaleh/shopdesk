import ProductForm from "@/components/client/manage/ProductForm";
import { PageHeader } from "@/components/client/manage/ui";

export default function NewProductPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Add product" />
      <ProductForm />
    </div>
  );
}
