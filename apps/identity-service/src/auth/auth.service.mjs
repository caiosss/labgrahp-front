import { prisma } from "../database/prisma.mjs";
import { hashPassword } from "../security/password.mjs";

export class EmailIsRegisteredError extends Error {}

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