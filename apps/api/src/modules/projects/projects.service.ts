import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import {
  isProjectOwnedBy,
  type ProjectPrincipal,
} from "../../common/types/project-principal";
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

  async findAll(principal: ProjectPrincipal) {
    const projects = await this.projectsRepository.findAllOwned(principal);
    return projects.map(toProjectResponse);
  }

  async findAllForUser(userId: string) {
    return this.findAll({ type: "identity", userId });
  }

  async findOne(principal: ProjectPrincipal, projectId: string) {
    const project = await this.projectsRepository.findOwnedProject(
      principal,
      projectId,
    );

    if (!project) throw new NotFoundException("Projeto não encontrado.");
    return toProjectResponse(project);
  }

  async upsert(
    principal: ProjectPrincipal,
    projectId: string,
    dto: UpsertProjectDto,
  ) {
    const existingProject = await this.projectsRepository.findById(projectId);

    if (existingProject && !isProjectOwnedBy(existingProject, principal)) {
      throw new ForbiddenException("Projeto não pertence ao usuário atual.");
    }

    const saveInput = {
      data: dto.data as Prisma.InputJsonValue,
      name: dto.name,
      principal,
      projectId,
      schemaVersion: dto.schemaVersion ?? 1,
      type: normalizeProjectType(dto.type),
    };

    const project = existingProject
      ? await this.projectsRepository.updateOwnedProject(saveInput)
      : await this.projectsRepository.createOwnedProject(saveInput);

    return toProjectResponse(project);
  }

  async remove(principal: ProjectPrincipal, projectId: string) {
    const result = await this.projectsRepository.markProjectAsDeleted(
      principal,
      projectId,
    );

    if (result.count === 0) {
      throw new NotFoundException("Projeto não encontrado.");
    }

    return { removed: true };
  }
}
