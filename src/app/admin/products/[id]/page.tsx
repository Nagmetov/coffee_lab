import { notFound } from "next/navigation";
import { getProductByIdForAdmin, listCategories } from "@/server/product-service";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Редактировать товар" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductByIdForAdmin(id),
    listCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-semibold">
        Редактировать: {product.name}
      </h2>
      <ProductForm
        categories={categories}
        productId={product.id}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          categoryId: product.categoryId,
          basePrice: Number(product.basePrice),
          tastingNotes: product.tastingNotes,
          tags: product.tags,
          variants: product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            priceModifier: Number(v.priceModifier),
            stock: v.stock,
            sku: v.sku,
          })),
        }}
      />
    </div>
  );
}
