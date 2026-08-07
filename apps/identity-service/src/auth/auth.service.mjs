import { prisma } from "../database/prisma.mjs";
import { hashPassword, verifyPassword } from "../security/password.mjs";
import {
    ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    createAccessToken,
} from "../security/tokens.mjs";

export class EmailIsRegisteredError extends Error {}
export class InvalidCredentialsError extends Error {}
export class UserNotFoundError extends Error {}

export const registerUser = async ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
        where: {
            normalizedEmail,
        },
        select: {
            id: true,
        },
    });

    if (existingUser) {
        throw new EmailIsRegisteredError("Email já está em uso.");
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

}

export const loginUser = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
        where: {
            normalizedEmail,
        },
        select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
        },
    });

    if (!user) {
        throw new UserNotFoundError("Usuário não encontrado.");
    }

    if (!user?.passwordHash) {
        throw new InvalidCredentialsError("Crendenciais inválidas.");
    }

    const isPasswordValid = await verifyPassword(user.passwordHash, password);

    if (!isPasswordValid) {
        throw new InvalidCredentialsError();
    }

    const accessToken = await createAccessToken(user.id);

    return {
        accessToken,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        tokenType: "Bearer",
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
    };
};
