import { Inject, Injectable } from "@nestjs/common";
import type { Prisma, ProjectType } from "@prisma/client";
import { PrismaService } from "../../common/database/prisma.service";

interface UpsertProjectInput {
  data: Prisma.InputJsonValue;
  name: string;
  projectId: string;
  schemaVersion: number;
  sessionId: string;
  type: ProjectType;
}

@Injectable()
export class ProjectsRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  findAllBySession(sessionId: string) {
    return this.prisma.project.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      where: {
        deletedAt: null,
        ownerSessionId: sessionId,
      },
    });
  }

  findOwnedProject(sessionId: string, projectId: string) {
    return this.prisma.project.findFirst({
      where: {
        deletedAt: null,
        id: projectId,
        ownerSessionId: sessionId,
      },
    });
  }

  findById(projectId: string) {
    return this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
  }

  upsertOwnedProject(input: UpsertProjectInput) {
    return this.prisma.project.upsert({
      create: {
        data: input.data,
        id: input.projectId,
        name: input.name,
        ownerSessionId: input.sessionId,
        schemaVersion: input.schemaVersion,
        type: input.type,
      },
      update: {
        data: input.data,
        deletedAt: null,
        name: input.name,
        schemaVersion: input.schemaVersion,
        type: input.type,
      },
      where: {
        id: input.projectId,
      },
    });
  }

  markProjectAsDeleted(sessionId: string, projectId: string) {
    return this.prisma.project.updateMany({
      data: {
        deletedAt: new Date(),
      },
      where: {
        deletedAt: null,
        id: projectId,
        ownerSessionId: sessionId,
      },
    });
  }
}
