import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerSchema } from "@/lib/validation/auth";
import { registerUser } from "@/server/auth-service";
import { setAuthCookies } from "@/lib/auth/cookies";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";
import { checkRateLimit } from "@/lib/rate-limit";

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

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      // Dev-mode stand-in for sending an email: the verification link is
      // returned directly instead of going through an SMTP provider.
      devVerificationUrl: `/auth/verify-email?token=${emailVerificationToken}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
