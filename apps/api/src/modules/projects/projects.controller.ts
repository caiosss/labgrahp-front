import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import { CurrentProjectPrincipal } from "../../common/decorators/current-project-principal.decorator";
import { ProjectPrincipalGuard } from "../../common/guards/project-principal.guard";
import type { ProjectPrincipal } from "../../common/types/project-principal";
import { UpsertProjectDto } from "./dto/upsert-project.dto";
import { ProjectsService } from "./projects.service";

@Controller("projects")
@UseGuards(ProjectPrincipalGuard)
export class ProjectsController {
  constructor(
    @Inject(ProjectsService)
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  findAll(@CurrentProjectPrincipal() principal: ProjectPrincipal) {
    return this.projectsService.findAll(principal);
  }

  @Get(":projectId")
  findOne(
    @CurrentProjectPrincipal() principal: ProjectPrincipal,
    @Param("projectId") projectId: string,
  ) {
    return this.projectsService.findOne(principal, projectId);
  }

  @Put(":projectId")
  upsert(
    @CurrentProjectPrincipal() principal: ProjectPrincipal,
    @Param("projectId") projectId: string,
    @Body() dto: UpsertProjectDto,
  ) {
    return this.projectsService.upsert(principal, projectId, dto);
  }

  @Delete(":projectId")
  remove(
    @CurrentProjectPrincipal() principal: ProjectPrincipal,
    @Param("projectId") projectId: string,
  ) {
    return this.projectsService.remove(principal, projectId);
  }
}
