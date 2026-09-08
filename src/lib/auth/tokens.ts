import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { randomBytes, createHash } from "node:crypto";

export type AccessTokenPayload = JWTPayload & {
  sub: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
};

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getAccessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(getAccessSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getAccessSecret());
  return payload as AccessTokenPayload;
}

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
