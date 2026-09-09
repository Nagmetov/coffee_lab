import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api/admin-guard";
import { productSchema } from "@/lib/validation/product";
import { createProduct } from "@/server/product-service";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  const guard = await requireAdminSession();
  if ("error" in guard) return guard.error;

  try {
    const input = productSchema.parse(await request.json());
    const product = await createProduct(input);
    return NextResponse.json({ product });
  } catch (error) {
    return handleApiError(error);
  }
}
