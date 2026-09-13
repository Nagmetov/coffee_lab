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
 *
 * Compares against the request's Host header rather than request.url's
 * host — under `output: "standalone"` (see Dockerfile/next.config.ts) the
 * server binds to 0.0.0.0 and request.url reflects that bind address, not
 * the host the client actually connected to, which would reject every
 * same-origin request in production.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin requests from browsers may omit Origin
  const host = request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
