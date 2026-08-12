import { prisma } from "../database/prisma.mjs";
import { createUserRegisteredEvent } from "../events/identity-events.mjs";

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
          emailVerifiedAt: existingUser.emailVerifiedAt ?? new Date(),
        },
      });
    }

    const user = await transaction.user.create({
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

    const event = createUserRegisteredEvent(user);

    await transaction.outboxEvent.create({
      data: {
        id: event.id,
        topic: event.topic,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        payload: event.payload,
      },
    });

    return user;
  });
};
