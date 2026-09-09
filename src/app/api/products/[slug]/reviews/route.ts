import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { addReview } from "@/server/product-service";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  const session = await getSession();
  if (!session) return jsonError("Войдите, чтобы оставить отзыв", 401);

  try {
    const { slug } = await params;
    const input = schema.parse(await request.json());

    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) return jsonError("Товар не найден", 404);

    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId: product.id, userId: session.sub } },
    });
    if (existing) {
      return jsonError("Вы уже оставили отзыв на этот товар", 409);
    }

    const review = await addReview(product.id, session.sub, input);
    return NextResponse.json({ review });
  } catch (error) {
    return handleApiError(error);
  }
}
