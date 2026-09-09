import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/api/respond";
import type { AccessTokenPayload } from "@/lib/auth/tokens";

/**
 * Route-level RBAC belt-and-suspenders: the proxy already blocks
 * non-admins from reaching /admin pages, but API routes under
 * /api/admin/** are reachable directly (not just via page navigation),
 * so they re-check here rather than trusting the caller came through
 * the UI.
 */
export async function requireAdminSession(): Promise<
  { session: AccessTokenPayload } | { error: Response }
> {
  const session = await getSession();
  if (!session) {
    return { error: jsonError("Не авторизован", 401) };
  }
  if (session.role !== "ADMIN") {
    return { error: jsonError("Недостаточно прав", 403) };
  }
  return { session };
}
