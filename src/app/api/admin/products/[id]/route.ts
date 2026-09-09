import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api/admin-guard";
import { productSchema } from "@/lib/validation/product";
import { updateProduct } from "@/server/product-service";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  const guard = await requireAdminSession();
  if ("error" in guard) return guard.error;

  try {
    const { id } = await params;
    const input = productSchema.parse(await request.json());
    await updateProduct(id, input);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
