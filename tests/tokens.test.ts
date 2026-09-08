import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = "test-secret-not-for-production-use-only-in-tests";
});

describe("access tokens", () => {
  it("round-trips a signed payload", async () => {
    const { signAccessToken, verifyAccessToken } = await import("@/lib/auth/tokens");
    const token = await signAccessToken({
      sub: "user_123",
      email: "demo@coffeelab.dev",
      role: "CUSTOMER",
    });

    const payload = await verifyAccessToken(token);
    expect(payload.sub).toBe("user_123");
    expect(payload.email).toBe("demo@coffeelab.dev");
    expect(payload.role).toBe("CUSTOMER");
  });

  it("rejects a token signed with a different secret", async () => {
    const { signAccessToken, verifyAccessToken } = await import("@/lib/auth/tokens");
    const token = await signAccessToken({
      sub: "user_123",
      email: "demo@coffeelab.dev",
      role: "CUSTOMER",
    });

    process.env.JWT_ACCESS_SECRET = "a-completely-different-secret-value-here";
    await expect(verifyAccessToken(token)).rejects.toThrow();
  });
});

describe("refresh tokens", () => {
  it("hashes the raw token deterministically", async () => {
    const { generateRefreshToken, hashToken } = await import("@/lib/auth/opaque-tokens");
    const { token, tokenHash } = generateRefreshToken();
    expect(hashToken(token)).toBe(tokenHash);
  });

  it("produces different tokens on each call", async () => {
    const { generateRefreshToken } = await import("@/lib/auth/opaque-tokens");
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a.token).not.toBe(b.token);
  });
});
