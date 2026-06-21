import { Inject, Injectable } from "@nestjs/common";
import type { SharePermission } from "@prisma/client";
import { PrismaService } from "../../common/database/prisma.service";

interface CreateShareInput {
  expiresAt?: Date;
  permission: SharePermission;
  projectId: string;
  tokenHash: string;
}

@Injectable()
export class SharesRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  create(input: CreateShareInput) {
    return this.prisma.projectShare.create({
      data: {
        expiresAt: input.expiresAt,
        permission: input.permission,
        projectId: input.projectId,
        tokenHash: input.tokenHash,
      },
      include: {
        project: true,
      },
    });
  }

  findActiveByTokenHash(tokenHash: string) {
    return this.prisma.projectShare.findUnique({
      include: {
        project: true,
      },
      where: {
        tokenHash,
      },
    });
  }

  revokeByProject(projectId: string) {
    return this.prisma.projectShare.updateMany({
      data: {
        revokedAt: new Date(),
      },
      where: {
        projectId,
        revokedAt: null,
      },
    });
  }
}
