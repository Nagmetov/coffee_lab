import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("Проверьте правильность заполнения формы", 422, {
      fieldErrors: error.flatten().fieldErrors,
    });
  }
  if (error instanceof Error && "code" in error) {
    const code = (error as { code: string }).code;
    const status =
      code === "INVALID_CREDENTIALS" || code === "INVALID_TOKEN"
        ? 401
        : code === "EMAIL_TAKEN"
          ? 409
          : 400;
    return jsonError(error.message, status);
  }
  console.error(error);
  return jsonError("Внутренняя ошибка сервера", 500);
}

/**
 * Minimal CSRF mitigation for cookie-authenticated mutating requests: the
 * cookie itself is SameSite=Lax (blocks cross-site form posts/simple
 * requests), and this adds a same-origin check as defense in depth for
 * fetch-based requests that a Lax cookie alone doesn't cover.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin requests from browsers may omit Origin
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
