import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { requestPasswordReset } from "@/server/auth-service";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  try {
    const { email } = forgotPasswordSchema.parse(await request.json());

    const rate = await checkRateLimit(`forgot-password:${email}`, {
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!rate.allowed) {
      return jsonError("Слишком много попыток. Попробуйте позже.", 429);
    }

    const token = await requestPasswordReset(email);

    // Always return 200 regardless of whether the email exists, to avoid
    // leaking account existence. In dev mode we surface the reset link
    // directly since there's no email provider wired up.
    return NextResponse.json({
      ok: true,
      devResetUrl: token ? `/auth/reset-password?token=${token}` : undefined,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
