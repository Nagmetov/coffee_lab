import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";

const schema = z.object({
  label: z.string().trim().min(1).max(60),
  line1: z.string().trim().min(3).max(200),
  city: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(1).max(20),
  phone: z.string().trim().min(5).max(30),
});

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Не авторизован", 401);

  const addresses = await prisma.address.findMany({
    where: { userId: session.sub },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ addresses });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  const session = await getSession();
  if (!session) return jsonError("Не авторизован", 401);

  try {
    const input = schema.parse(await request.json());
    const existingCount = await prisma.address.count({ where: { userId: session.sub } });

    const address = await prisma.address.create({
      data: { ...input, userId: session.sub, isDefault: existingCount === 0 },
    });
    return NextResponse.json({ address });
  } catch (error) {
    return handleApiError(error);
  }
}
