import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/api/admin-guard";
import { setProductActive } from "@/server/product-service";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";

const schema = z.object({ isActive: z.boolean() });

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
    const { isActive } = schema.parse(await request.json());
    await setProductActive(id, isActive);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
