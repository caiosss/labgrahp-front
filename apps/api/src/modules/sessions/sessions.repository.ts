import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";

@Injectable()
export class SessionsRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) { }

  create(tokenHash: string) {
    return this.prisma.session.create({
      data: {
        tokenHash,
      },
    });
  }

  findById(sessionId: string) {
    return this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });
  }

  findActiveByTokenHash(tokenHash: string) {
    return this.prisma.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
      },
      select: {
        id: true,
      },
    });
  }

  claimProjects(
    sessionId: string,
    userId: string,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const result = await transaction.project.updateMany({
        where: {
          ownerSessionId: sessionId,
          ownerUserId: null,
        },
        data: {
          ownerSessionId: null,
          ownerUserId: userId,
        },
      });

      const projects = await transaction.project.findMany({
        orderBy: { updatedAt: "desc" },
        where: {
          deletedAt: null,
          ownerUserId: userId,
        },
      });

      return {
        claimedProjects: result.count,
        projects,
      };
    });
  }
}
