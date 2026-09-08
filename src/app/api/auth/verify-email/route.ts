import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyEmail, AuthError } from "@/server/auth-service";
import { handleApiError, jsonError } from "@/lib/api/respond";

const schema = z.object({ token: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const { token } = schema.parse(await request.json());
    await verifyEmail(token);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return jsonError(error.message, 400);
    }
    return handleApiError(error);
  }
}
