import ProductForm from "@/components/manage/ProductForm";
import { PageHeader } from "@/components/manage/ui";

export default function NewProductPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Add product" />
      <ProductForm />
    </div>
  );
}
