import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api/admin-guard";
import { adminListReviews } from "@/server/product-service";
import { handleApiError } from "@/lib/api/respond";

export async function GET() {
  const guard = await requireAdminSession();
  if ("error" in guard) return guard.error;

  try {
    const reviews = await adminListReviews();
    return NextResponse.json({ reviews });
  } catch (error) {
    return handleApiError(error);
  }
}
