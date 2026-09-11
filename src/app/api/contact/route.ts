import { NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendContactNotification } from "@/lib/email";

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
    const { sent } = await sendContactNotification(input.name, input.email, input.message);
    // Belt and suspenders: if CONTACT_INBOX_EMAIL isn't set (or sending
    // failed), keep the message somewhere instead of silently discarding it.
    if (!sent) {
      console.info("[contact] new message (not emailed)", input);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
