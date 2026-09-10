import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerSchema } from "@/lib/validation/auth";
import { registerUser } from "@/server/auth-service";
import { setAuthCookies } from "@/lib/auth/cookies";
import { sendVerificationEmail } from "@/lib/email";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";
import { checkRateLimit } from "@/lib/rate-limit";
import { getGuestTokenCookie } from "@/lib/cart-identity";
import { mergeGuestCartIntoUser } from "@/server/cart-service";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rate = await checkRateLimit(`register:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rate.allowed) {
    return jsonError("Слишком много попыток регистрации. Попробуйте позже.", 429);
  }

  try {
    const body = registerSchema.parse(await request.json());
    const { user, session, emailVerificationToken } = await registerUser(body);

    const cookieStore = await cookies();
    setAuthCookies(cookieStore, session);

    const guestToken = await getGuestTokenCookie();
    if (guestToken) {
      await mergeGuestCartIntoUser(user.id, guestToken);
    }

    const verificationPath = `/auth/verify-email?token=${emailVerificationToken}`;
    const { sent } = await sendVerificationEmail(
      user.email,
      user.name,
      `${process.env.APP_URL}${verificationPath}`,
    );

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      // No email provider configured — return the link directly instead of
      // leaving the user stuck with a mail that never arrives.
      devVerificationUrl: sent ? undefined : verificationPath,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
