import { NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  message: z.string().trim().min(5).max(2000),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rate = await checkRateLimit(`contact:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rate.allowed) {
    return jsonError("Слишком много сообщений. Попробуйте позже.", 429);
  }

  try {
    const input = schema.parse(await request.json());
    // No email/CRM integration wired up for this demo — log server-side
    // instead of silently discarding the message.
    console.info("[contact] new message", input);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
