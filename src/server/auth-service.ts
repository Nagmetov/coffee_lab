import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signAccessToken } from "@/lib/auth/tokens";
import {
  generateOpaqueToken,
  generateRefreshToken,
  hashToken,
} from "@/lib/auth/opaque-tokens";
import type { Role } from "@prisma/client";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code:
      "EMAIL_TAKEN" | "INVALID_CREDENTIALS" | "INVALID_TOKEN" | "EMAIL_NOT_VERIFIED",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

type SessionMeta = { userAgent?: string; ipAddress?: string };

async function issueSession(
  user: { id: string; email: string; role: Role },
  meta: SessionMeta = {},
) {
  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refresh = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refresh.tokenHash,
      expiresAt: refresh.expiresAt,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    },
  });

  return { accessToken, refreshToken: refresh.token };
}

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AuthError("Пользователь с таким email уже существует", "EMAIL_TAKEN");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash, name: input.name },
  });

  const verification = generateOpaqueToken();
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      tokenHash: verification.tokenHash,
      type: "EMAIL_VERIFY",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const session = await issueSession(user);
  return { user, session, emailVerificationToken: verification.token };
}

export async function authenticateUser(
  input: { email: string; password: string },
  meta: SessionMeta = {},
) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AuthError("Неверный email или пароль", "INVALID_CREDENTIALS");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Неверный email или пароль", "INVALID_CREDENTIALS");
  }

  const session = await issueSession(user, meta);
  return { user, session };
}

/**
 * Refresh-token rotation: every use invalidates the old token and issues a
 * new one. If a *revoked* token is presented again, that's a strong signal
 * the token was stolen and already used by someone else — so we revoke the
 * entire token family (all sessions for that user) rather than just
 * rejecting the one request.
 */
export async function rotateRefreshToken(rawToken: string, meta: SessionMeta = {}) {
  const tokenHash = hashToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored) {
    throw new AuthError("Сессия недействительна", "INVALID_TOKEN");
  }

  if (stored.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new AuthError("Сессия недействительна", "INVALID_TOKEN");
  }

  if (stored.expiresAt < new Date()) {
    throw new AuthError("Сессия истекла", "INVALID_TOKEN");
  }

  const next = generateRefreshToken();
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedBy: next.tokenHash },
    }),
    prisma.refreshToken.create({
      data: {
        userId: stored.userId,
        tokenHash: next.tokenHash,
        expiresAt: next.expiresAt,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
      },
    }),
  ]);

  const accessToken = await signAccessToken({
    sub: stored.user.id,
    email: stored.user.email,
    role: stored.user.role,
  });

  return { user: stored.user, accessToken, refreshToken: next.token };
}

export async function revokeRefreshToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function verifyEmail(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  // Atomically claim the token with a conditional UPDATE (usedAt: null in
  // the WHERE clause) instead of find-then-update, so two concurrent
  // requests with the same token can't both "succeed" — Postgres row
  // locking serializes the racing UPDATEs and only one can match.
  const claim = await prisma.verificationToken.updateMany({
    where: {
      tokenHash,
      type: "EMAIL_VERIFY",
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });

  if (claim.count === 0) {
    throw new AuthError(
      "Ссылка подтверждения недействительна или устарела",
      "INVALID_TOKEN",
    );
  }

  const stored = await prisma.verificationToken.findUniqueOrThrow({
    where: { tokenHash },
  });
  await prisma.user.update({
    where: { id: stored.userId },
    data: { emailVerified: true },
  });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal whether the email exists.
    return null;
  }

  const reset = generateOpaqueToken();
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      tokenHash: reset.tokenHash,
      type: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  return reset.token;
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const tokenHash = hashToken(rawToken);

  // Same atomic-claim pattern as verifyEmail: closes the race where two
  // concurrent requests both read the token as unused.
  const claim = await prisma.verificationToken.updateMany({
    where: {
      tokenHash,
      type: "PASSWORD_RESET",
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });

  if (claim.count === 0) {
    throw new AuthError(
      "Ссылка сброса пароля недействительна или устарела",
      "INVALID_TOKEN",
    );
  }

  const stored = await prisma.verificationToken.findUniqueOrThrow({
    where: { tokenHash },
  });
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: stored.userId }, data: { passwordHash } }),
    // Reset invalidates all existing sessions.
    prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}
