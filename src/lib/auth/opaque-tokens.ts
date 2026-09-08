import { randomBytes, createHash } from "node:crypto";

/**
 * Kept separate from tokens.ts (which only touches `jose`) because
 * `node:crypto` isn't available in the Edge runtime that next/middleware
 * runs in — bundling it there breaks the build.
 */

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Refresh tokens are opaque random strings, not JWTs: we store only a
 * SHA-256 hash of the token server-side (`RefreshToken.tokenHash`), so a
 * leaked database dump can't be replayed as valid tokens. The raw token is
 * only ever seen by the client, in an httpOnly cookie.
 */
export function generateRefreshToken(): {
  token: string;
  tokenHash: string;
  expiresAt: Date;
} {
  const token = randomBytes(48).toString("base64url");
  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateOpaqueToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}
