import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/tokens";

const ADMIN_PREFIX = "/admin";
const CUSTOMER_PREFIXES = ["/profile", "/orders", "/checkout"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAdmin = pathname.startsWith(ADMIN_PREFIX);
  const needsAuth = needsAdmin || CUSTOMER_PREFIXES.some((p) => pathname.startsWith(p));

  if (!needsAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const session = token ? await verifyAccessToken(token).catch(() => null) : null;

  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (needsAdmin && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/orders/:path*", "/checkout/:path*"],
};
