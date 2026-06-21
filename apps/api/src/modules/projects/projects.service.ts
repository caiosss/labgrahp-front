import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { normalizeProjectType } from "./dto/project-type.dto";
import type { UpsertProjectDto } from "./dto/upsert-project.dto";
import { toProjectResponse } from "./projects.mapper";
import { ProjectsRepository } from "./projects.repository";

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(ProjectsRepository)
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async findAll(sessionId: string) {
    const projects = await this.projectsRepository.findAllBySession(sessionId);

    return projects.map(toProjectResponse);
  }

  async findOne(sessionId: string, projectId: string) {
    const project = await this.projectsRepository.findOwnedProject(
      sessionId,
      projectId,
    );

    if (!project) {
      throw new NotFoundException("Projeto não encontrado.");
    }

    return toProjectResponse(project);
  }

  async upsert(sessionId: string, projectId: string, dto: UpsertProjectDto) {
    const existingProject = await this.projectsRepository.findById(projectId);

    if (existingProject && existingProject.ownerSessionId !== sessionId) {
      throw new ForbiddenException("Projeto não pertence à sessão atual.");
    }

    const project = await this.projectsRepository.upsertOwnedProject({
      data: dto.data as Prisma.InputJsonValue,
      name: dto.name,
      projectId,
      schemaVersion: dto.schemaVersion ?? 1,
      sessionId,
      type: normalizeProjectType(dto.type),
    });

    return toProjectResponse(project);
  }

  async remove(sessionId: string, projectId: string) {
    const result = await this.projectsRepository.markProjectAsDeleted(
      sessionId,
      projectId,
    );

    if (result.count === 0) {
      throw new NotFoundException("Projeto não encontrado.");
    }

    return {
      removed: true,
    };
  }
}
