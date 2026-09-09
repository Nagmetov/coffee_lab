import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/auth/session";

const GUEST_TOKEN_COOKIE = "guest_cart_token";

export type CartIdentity =
  { type: "user"; userId: string } | { type: "guest"; guestToken: string };

export async function resolveCartIdentity(): Promise<CartIdentity> {
  const session = await getSession();
  if (session) {
    return { type: "user", userId: session.sub };
  }

  const cookieStore = await cookies();
  let guestToken = cookieStore.get(GUEST_TOKEN_COOKIE)?.value;
  if (!guestToken) {
    guestToken = nanoid(24);
    cookieStore.set(GUEST_TOKEN_COOKIE, guestToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
  }
  return { type: "guest", guestToken };
}

export async function getGuestTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_TOKEN_COOKIE)?.value;
}

export { GUEST_TOKEN_COOKIE };
