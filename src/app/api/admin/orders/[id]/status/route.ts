import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/api/admin-guard";
import {
  adminUpdateOrderStatus,
  InvalidOrderTransitionError,
} from "@/server/order-service";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";
import { sendOrderStatusEmail } from "@/lib/email";
import { ORDER_STATUS_LABELS } from "@/lib/order-state-machine";

const schema = z.object({
  status: z.enum(["PENDING", "PAID", "PREPARING", "READY", "COMPLETED", "CANCELLED"]),
  note: z.string().max(300).optional(),
});

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
    const { status, note } = schema.parse(await request.json());
    const order = await adminUpdateOrderStatus(id, status, guard.session.sub, note);

    // A failed notification email shouldn't fail an already-applied status change.
    sendOrderStatusEmail(order.user.email, order.user.name, order, ORDER_STATUS_LABELS[status]).catch(
      (error) => console.error("[admin/orders/status] failed to send status email", error),
    );

    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof InvalidOrderTransitionError) {
      return jsonError(error.message, 422);
    }
    return handleApiError(error);
  }
}
