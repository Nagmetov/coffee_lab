import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api/respond";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return jsonError("Не авторизован", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      loyaltyPoints: true,
      loyaltyTier: true,
      createdAt: true,
    },
  });

  if (!user) {
    return jsonError("Не авторизован", 401);
  }

  return NextResponse.json({ user });
}
