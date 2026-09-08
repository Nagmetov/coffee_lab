import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { resetPassword, AuthError } from "@/server/auth-service";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  try {
    const { token, password } = resetPasswordSchema.parse(await request.json());
    await resetPassword(token, password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return jsonError(error.message, 400);
    }
    return handleApiError(error);
  }
}
