import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api/admin-guard";
import { promotionApiSchema } from "@/lib/validation/promotion";
import { createPromotion } from "@/server/promotion-service";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  const guard = await requireAdminSession();
  if ("error" in guard) return guard.error;

  try {
    const input = promotionApiSchema.parse(await request.json());
    const promotion = await createPromotion(input);
    return NextResponse.json({ promotion });
  } catch (error) {
    return handleApiError(error);
  }
}
