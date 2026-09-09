import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginSchema } from "@/lib/validation/auth";
import { authenticateUser, AuthError } from "@/server/auth-service";
import { setAuthCookies } from "@/lib/auth/cookies";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";
import { checkRateLimit } from "@/lib/rate-limit";
import { getGuestTokenCookie } from "@/lib/cart-identity";
import { mergeGuestCartIntoUser } from "@/server/cart-service";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const body = loginSchema.parse(await request.json());

  // Rate-limit by IP and by the attempted email, so a distributed attempt
  // against one account is still throttled even from many IPs.
  const [ipRate, emailRate] = await Promise.all([
    checkRateLimit(`login:ip:${ip}`, { limit: 20, windowMs: 15 * 60 * 1000 }),
    checkRateLimit(`login:email:${body.email}`, { limit: 8, windowMs: 15 * 60 * 1000 }),
  ]);
  if (!ipRate.allowed || !emailRate.allowed) {
    return jsonError("Слишком много попыток входа. Попробуйте позже.", 429);
  }

  try {
    const { user, session } = await authenticateUser(body, {
      userAgent: request.headers.get("user-agent") ?? undefined,
      ipAddress: ip,
    });

    const cookieStore = await cookies();
    setAuthCookies(cookieStore, session);

    const guestToken = await getGuestTokenCookie();
    if (guestToken) {
      await mergeGuestCartIntoUser(user.id, guestToken);
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return jsonError(error.message, 401);
    }
    return handleApiError(error);
  }
}
