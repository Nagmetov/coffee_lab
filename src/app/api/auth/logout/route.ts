import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { REFRESH_COOKIE, clearAuthCookies } from "@/lib/auth/cookies";
import { revokeRefreshToken } from "@/server/auth-service";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  clearAuthCookies(cookieStore);
  return NextResponse.json({ ok: true });
}
