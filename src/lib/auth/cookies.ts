export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

const isProd = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
};

type CookieSetter = {
  set(name: string, value: string, options?: Record<string, unknown>): unknown;
};

export function setAuthCookies(
  cookies: CookieSetter,
  { accessToken, refreshToken }: { accessToken: string; refreshToken: string },
) {
  cookies.set(ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60,
  });
  cookies.set(REFRESH_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearAuthCookies(cookies: CookieSetter) {
  cookies.set(ACCESS_COOKIE, "", { ...baseCookieOptions, maxAge: 0 });
  cookies.set(REFRESH_COOKIE, "", { ...baseCookieOptions, maxAge: 0 });
}
