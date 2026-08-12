import { Inject, Injectable } from "@nestjs/common";
import type { Prisma, ProjectType } from "@prisma/client";
import { PrismaService } from "../../common/database/prisma.service";
import type { ProjectPrincipal } from "../../common/types/project-principal";

interface SaveProjectInput {
  data: Prisma.InputJsonValue;
  name: string;
  principal: ProjectPrincipal;
  projectId: string;
  schemaVersion: number;
  type: ProjectType;
}

@Injectable()
export class ProjectsRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  private ownerWhere(principal: ProjectPrincipal): Prisma.ProjectWhereInput {
    return principal.type === "identity"
      ? { ownerUserId: principal.userId }
      : { ownerSessionId: principal.sessionId };
  }

  private ownerCreate(principal: ProjectPrincipal) {
    return principal.type === "identity"
      ? { ownerSessionId: null, ownerUserId: principal.userId }
      : { ownerSessionId: principal.sessionId, ownerUserId: null };
  }

  findAllOwned(principal: ProjectPrincipal) {
    return this.prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      where: {
        deletedAt: null,
        ...this.ownerWhere(principal),
      },
    });
  }

  findOwnedProject(principal: ProjectPrincipal, projectId: string) {
    return this.prisma.project.findFirst({
      where: {
        deletedAt: null,
        id: projectId,
        ...this.ownerWhere(principal),
      },
    });
  }

  findById(projectId: string) {
    return this.prisma.project.findUnique({ where: { id: projectId } });
  }

  createOwnedProject(input: SaveProjectInput) {
    return this.prisma.project.create({
      data: {
        data: input.data,
        id: input.projectId,
        name: input.name,
        ...this.ownerCreate(input.principal),
        schemaVersion: input.schemaVersion,
        type: input.type,
      },
    });
  }

  updateOwnedProject(input: SaveProjectInput) {
    return this.prisma.project.update({
      data: {
        data: input.data,
        deletedAt: null,
        name: input.name,
        schemaVersion: input.schemaVersion,
        type: input.type,
      },
      where: { id: input.projectId },
    });
  }

  markProjectAsDeleted(principal: ProjectPrincipal, projectId: string) {
    return this.prisma.project.updateMany({
      data: { deletedAt: new Date() },
      where: {
        deletedAt: null,
        id: projectId,
        ...this.ownerWhere(principal),
      },
    });
  }
}
