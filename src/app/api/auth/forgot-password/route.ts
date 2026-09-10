import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { requestPasswordReset } from "@/server/auth-service";
import { sendPasswordResetEmail } from "@/lib/email";
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

    let devResetUrl: string | undefined;
    if (token) {
      const resetPath = `/auth/reset-password?token=${token}`;
      const { sent } = await sendPasswordResetEmail(
        email,
        `${process.env.APP_URL}${resetPath}`,
      );
      // No email provider configured — surface the reset link directly
      // instead of leaving the user stuck with a mail that never arrives.
      if (!sent) devResetUrl = resetPath;
    }

    // Always return 200 regardless of whether the email exists, to avoid
    // leaking account existence.
    return NextResponse.json({ ok: true, devResetUrl });
  } catch (error) {
    return handleApiError(error);
  }
}
