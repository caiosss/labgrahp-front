import { Inject, Injectable } from "@nestjs/common";
import type { Prisma, ProjectType } from "@prisma/client";
import { PrismaService } from "../../common/database/prisma.service";

interface UpsertDraftInput {
  data: Prisma.InputJsonValue;
  projectId?: string;
  schemaVersion: number;
  sessionId: string;
  type: ProjectType;
}

@Injectable()
export class DraftsRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  findBySessionAndType(sessionId: string, type: ProjectType) {
    return this.prisma.draft.findUnique({
      where: {
        ownerSessionId_type: {
          ownerSessionId: sessionId,
          type,
        },
      },
    });
  }

  upsert(input: UpsertDraftInput) {
    return this.prisma.draft.upsert({
      create: {
        data: input.data,
        ownerSessionId: input.sessionId,
        projectId: input.projectId,
        schemaVersion: input.schemaVersion,
        type: input.type,
      },
      update: {
        data: input.data,
        projectId: input.projectId,
        schemaVersion: input.schemaVersion,
      },
      where: {
        ownerSessionId_type: {
          ownerSessionId: input.sessionId,
          type: input.type,
        },
      },
    });
  }

  deleteBySessionAndType(sessionId: string, type: ProjectType) {
    return this.prisma.draft.deleteMany({
      where: {
        ownerSessionId: sessionId,
        type,
      },
    });
  }
}
