import { Body, Controller, Delete, Get, Inject, Param, Put, UseGuards } from "@nestjs/common";
import { CurrentSession } from "../../common/decorators/current-session.decorator";
import { SessionTokenGuard } from "../../common/guards/session-token.guard";
import type { RequestSession } from "../../common/types/request-with-session";
import { UpsertProjectDto } from "./dto/upsert-project.dto";
import { ProjectsService } from "./projects.service";

@Controller("projects")
@UseGuards(SessionTokenGuard)
export class ProjectsController {
  constructor(
    @Inject(ProjectsService)
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  findAll(@CurrentSession() session: RequestSession) {
    return this.projectsService.findAll(session.id);
  }

  @Get(":projectId")
  findOne(
    @CurrentSession() session: RequestSession,
    @Param("projectId") projectId: string,
  ) {
    return this.projectsService.findOne(session.id, projectId);
  }

  @Put(":projectId")
  upsert(
    @CurrentSession() session: RequestSession,
    @Param("projectId") projectId: string,
    @Body() dto: UpsertProjectDto,
  ) {
    return this.projectsService.upsert(session.id, projectId, dto);
  }

  @Delete(":projectId")
  remove(
    @CurrentSession() session: RequestSession,
    @Param("projectId") projectId: string,
  ) {
    return this.projectsService.remove(session.id, projectId);
  }
}
