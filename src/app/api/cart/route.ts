import { NextResponse } from "next/server";
import { resolveCartIdentity } from "@/lib/cart-identity";
import { getGuestCartView, getUserCartView } from "@/server/cart-service";

export async function GET() {
  const identity = await resolveCartIdentity();
  const cart =
    identity.type === "user"
      ? await getUserCartView(identity.userId)
      : await getGuestCartView(identity.guestToken);
  return NextResponse.json({ cart });
}
