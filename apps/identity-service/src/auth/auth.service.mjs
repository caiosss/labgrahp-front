import { prisma } from "../database/prisma.mjs";
import { hashPassword, verifyPassword } from "../security/password.mjs";
import {
  createRefreshToken,
  getRefreshTokenExpiration,
  hashRefreshToken,
} from "../security/refresh-tokens.mjs";
import {
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  createAccessToken,
} from "../security/tokens.mjs";

export class EmailIsRegisteredError extends Error {}
export class InvalidCredentialsError extends Error {}
export class InvalidRefreshTokenError extends Error {}
export class UserNotFoundError extends Error {}

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    throw new EmailIsRegisteredError("E-mail já está em uso.");
  }

  const passwordHash = await hashPassword(password);

  return prisma.user.create({
    data: {
      email: email.trim(),
      normalizedEmail,
      name: name.trim(),
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });
};

export const loginUser = async ({ email, password }, sessionContext) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { normalizedEmail },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    throw new InvalidCredentialsError();
  }

  const isPasswordValid = await verifyPassword(user.passwordHash, password);

  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  const accessToken = await createAccessToken(user.id);
  const refreshToken = createRefreshToken();

  await prisma.refreshSession.create({
    data: {
      expiresAt: getRefreshTokenExpiration(),
      ipAddress: sessionContext.ipAddress,
      tokenHash: hashRefreshToken(refreshToken),
      userAgent: sessionContext.userAgent,
      userId: user.id,
    },
  });

  return createUserSession(user, sessionContext);
};

export const rotateRefreshToken = async (currentToken, sessionContext) => {
  const currentSession = await prisma.refreshSession.findUnique({
    where: { tokenHash: hashRefreshToken(currentToken) },
    select: {
      expiresAt: true,
      id: true,
      revokedAt: true,
      user: { select: { email: true, id: true, name: true } },
      userId: true,
    },
  });

  if (
    !currentSession ||
    currentSession.revokedAt ||
    currentSession.expiresAt.getTime() <= Date.now()
  ) {
    throw new InvalidRefreshTokenError();
  }

  const accessToken = await createAccessToken(currentSession.userId);
  const refreshToken = createRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);

  await prisma.$transaction(async (transaction) => {
    const revoked = await transaction.refreshSession.updateMany({
      data: { lastUsedAt: new Date(), revokedAt: new Date() },
      where: { id: currentSession.id, revokedAt: null },
    });

    if (revoked.count !== 1) {
      throw new InvalidRefreshTokenError();
    }

    await transaction.refreshSession.create({
      data: {
        expiresAt: getRefreshTokenExpiration(),
        ipAddress: sessionContext.ipAddress,
        tokenHash,
        userAgent: sessionContext.userAgent,
        userId: currentSession.userId,
      },
    });
  });

  return {
    accessToken,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    refreshToken,
    tokenType: "Bearer",
    user: currentSession.user,
  };
};

export const logoutSession = async (refreshToken) => {
  if (!refreshToken) return;

  await prisma.refreshSession.updateMany({
    data: { revokedAt: new Date() },
    where: {
      revokedAt: null,
      tokenHash: hashRefreshToken(refreshToken),
    },
  });
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerifiedAt: true,
      createdAt: true,
    },
  });

  if (!user) throw new UserNotFoundError();
  return user;
};

export const createUserSession = async (user, sessionContext) => {
  const accessToken = await createAccessToken(user.id);
  const refreshToken = createRefreshToken();

  await prisma.refreshSession.create({
    data: {
      expiresAt: getRefreshTokenExpiration(),
      ipAddress: sessionContext.ipAddress,
      tokenHash: hashRefreshToken(refreshToken),
      userAgent: sessionContext.userAgent,
      userId: user.id,
    },
  });

  return {
    accessToken,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    refreshToken,
    tokenType: "Bearer",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};