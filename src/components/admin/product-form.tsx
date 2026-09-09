"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { productSchema, type ProductFormInput } from "@/lib/validation/product";
import { apiJson, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = { id: string; name: string };

export function ProductForm({
  categories,
  defaultValues,
  productId,
}: {
  categories: Category[];
  defaultValues?: ProductFormInput;
  productId?: string;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues ?? {
      name: "",
      slug: "",
      description: "",
      categoryId: categories[0]?.id ?? "",
      basePrice: 0,
      tastingNotes: [],
      tags: [],
      variants: [{ name: "Стандарт", priceModifier: 0, stock: 0, sku: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const categoryId = watch("categoryId");

  async function onSubmit(values: ProductFormInput) {
    try {
      if (productId) {
        await apiJson(`/api/admin/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        toast.success("Товар обновлён");
      } else {
        await apiJson("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        toast.success("Товар создан");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setError("root", { message: error.message });
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Название</Label>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && (
            <p className="text-destructive text-sm">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input id="slug" {...register("slug")} aria-invalid={!!errors.slug} />
          {errors.slug && (
            <p className="text-destructive text-sm">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea id="description" rows={3} {...register("description")} />
        {errors.description && (
          <p className="text-destructive text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Категория</Label>
          <Select
            value={categoryId}
            onValueChange={(value) => {
              if (value) setValue("categoryId", String(value), { shouldValidate: true });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {() =>
                  categories.find((c) => c.id === categoryId)?.name ??
                  "Выберите категорию"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-destructive text-sm">{errors.categoryId.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="basePrice">Базовая цена, ₽</Label>
          <Input
            id="basePrice"
            type="number"
            step="1"
            {...register("basePrice", { valueAsNumber: true })}
          />
          {errors.basePrice && (
            <p className="text-destructive text-sm">{errors.basePrice.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Варианты</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", priceModifier: 0, stock: 0, sku: "" })}
          >
            <Plus className="size-4" /> Добавить вариант
          </Button>
        </div>
        {errors.variants?.message && (
          <p className="text-destructive text-sm">{errors.variants.message}</p>
        )}
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border-border flex items-end gap-2 rounded-md border p-2"
            >
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Название</Label>
                <Input {...register(`variants.${index}.name`)} />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs">Надбавка, ₽</Label>
                <Input
                  type="number"
                  {...register(`variants.${index}.priceModifier`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="w-20 space-y-1">
                <Label className="text-xs">Остаток</Label>
                <Input
                  type="number"
                  {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                />
              </div>
              <div className="w-28 space-y-1">
                <Label className="text-xs">SKU</Label>
                <Input {...register(`variants.${index}.sku`)} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={fields.length <= 1}
                onClick={() => remove(index)}
              >
                <Trash2 className="text-destructive size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {errors.root && <p className="text-destructive text-sm">{errors.root.message}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Сохраняем…" : productId ? "Сохранить" : "Создать товар"}
      </Button>
    </form>
  );
}
