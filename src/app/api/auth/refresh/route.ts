import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { rotateRefreshToken, AuthError } from "@/server/auth-service";
import { jsonError } from "@/lib/api/respond";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return jsonError("Не авторизован", 401);
  }

  try {
    const {
      user,
      accessToken,
      refreshToken: nextRefreshToken,
    } = await rotateRefreshToken(refreshToken, {
      userAgent: request.headers.get("user-agent") ?? undefined,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    setAuthCookies(cookieStore, { accessToken, refreshToken: nextRefreshToken });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    clearAuthCookies(cookieStore);
    if (error instanceof AuthError) {
      return jsonError(error.message, 401);
    }
    return jsonError("Не удалось обновить сессию", 401);
  }
}
