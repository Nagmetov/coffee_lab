import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export type AccessTokenPayload = JWTPayload & {
  sub: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
};

const ACCESS_TOKEN_TTL = "15m";

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
