import { z } from "zod";

export const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(60),
  priceModifier: z.number().min(-100000).max(100000),
  stock: z.number().int().min(0).max(100000),
  sku: z.string().trim().min(1).max(40),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  description: z.string().trim().min(5).max(2000),
  categoryId: z.string().min(1),
  basePrice: z.number().min(0).max(1000000),
  tastingNotes: z.array(z.string().trim().min(1)),
  tags: z.array(z.string().trim().min(1)),
  variants: z.array(variantSchema).min(1, "Добавьте хотя бы один вариант"),
});

export type ProductFormInput = z.infer<typeof productSchema>;
