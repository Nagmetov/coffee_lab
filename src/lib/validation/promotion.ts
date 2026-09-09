import { z } from "zod";

const baseFields = {
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3)
    .max(30)
    .regex(/^[A-Z0-9-]+$/, "Только латиница, цифры и дефис"),
  description: z.string().trim().min(3).max(200),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minOrderAmount: z.number().min(0),
  usageLimit: z.number().int().positive().nullable(),
  isActive: z.boolean(),
};

// Client form: react-hook-form's `valueAsDate` gives real Date objects, so
// zodResolver's input/output types line up cleanly with z.date().
export const promotionSchema = z
  .object({ ...baseFields, validFrom: z.date(), validTo: z.date() })
  .refine((data) => data.validTo > data.validFrom, {
    message: "Дата окончания должна быть позже даты начала",
    path: ["validTo"],
  })
  .refine((data) => data.type !== "PERCENT" || data.value <= 100, {
    message: "Процентная скидка не может превышать 100",
    path: ["value"],
  });

export type PromotionFormInput = z.infer<typeof promotionSchema>;

// API route: JSON.stringify turns those same Date objects into ISO
// strings over the wire, so parsing the request body needs coercion —
// kept as a separate schema so the client form isn't affected by it.
export const promotionApiSchema = z
  .object({ ...baseFields, validFrom: z.coerce.date(), validTo: z.coerce.date() })
  .refine((data) => data.validTo > data.validFrom, {
    message: "Дата окончания должна быть позже даты начала",
    path: ["validTo"],
  })
  .refine((data) => data.type !== "PERCENT" || data.value <= 100, {
    message: "Процентная скидка не может превышать 100",
    path: ["value"],
  });
