import { listCategories } from "@/server/product-service";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Новый товар" };

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-semibold">Новый товар</h2>
      <ProductForm categories={categories} />
    </div>
  );
}
