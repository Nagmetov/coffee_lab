/**
 * fetch wrapper for cookie-authenticated API calls: on a 401 it makes one
 * attempt to silently refresh the access token via /api/auth/refresh, then
 * retries the original request once. Callers never have to think about
 * token expiry themselves.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const first = await fetch(input, { ...init, credentials: "include" });
  if (first.status !== 401 || input === "/api/auth/refresh") {
    return first;
  }

  const refreshed = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  if (!refreshed.ok) {
    return first;
  }

  return fetch(input, { ...init, credentials: "include" });
}

export async function apiJson<T>(input: string, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(input, init);
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(
      data.error ?? "Что-то пошло не так",
      response.status,
      data.fieldErrors,
    );
  }
  return data as T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[] | undefined>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
