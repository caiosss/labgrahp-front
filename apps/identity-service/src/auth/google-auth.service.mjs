import { prisma } from "../database/prisma.mjs";

export const findOrCreateGoogleUser = async ({
  email,
  name,
  providerSubject,
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  return prisma.$transaction(async (transaction) => {
    const externalAccount = await transaction.externalAccount.findUnique({
      where: {
        provider_providerSubject: {
          provider: "GOOGLE",
          providerSubject,
        },
      },
      include: {
        user: true,
      },
    });

    if (externalAccount) {
      return externalAccount.user;
    }

    const existingUser = await transaction.user.findUnique({
      where: { normalizedEmail },
    });

    if (existingUser) {
      await transaction.externalAccount.create({
        data: {
          provider: "GOOGLE",
          providerSubject,
          userId: existingUser.id,
        },
      });

      return transaction.user.update({
        where: { id: existingUser.id },
        data: {
          emailVerifiedAt:
            existingUser.emailVerifiedAt ?? new Date(),
        },
      });
    }

    return transaction.user.create({
      data: {
        email: email.trim(),
        normalizedEmail,
        name: name.trim(),
        emailVerifiedAt: new Date(),
        externalAccounts: {
          create: {
            provider: "GOOGLE",
            providerSubject,
          },
        },
      },
    });
  });
};