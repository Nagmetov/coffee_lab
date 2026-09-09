import { prisma } from "@/lib/prisma";
import type { PromotionType } from "@prisma/client";

export async function listPromotions() {
  return prisma.promotion.findMany({ orderBy: { validFrom: "desc" } });
}

export type PromotionInput = {
  code: string;
  description: string;
  type: PromotionType;
  value: number;
  minOrderAmount: number;
  usageLimit: number | null;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
};

export async function createPromotion(input: PromotionInput) {
  return prisma.promotion.create({ data: input });
}

export async function updatePromotion(id: string, input: Partial<PromotionInput>) {
  return prisma.promotion.update({ where: { id }, data: input });
}
