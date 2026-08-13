import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { CurrentIdentity } from "../../common/identity-auth/current-identity.decorator";
import { IdentityTokenGuard } from "../../common/identity-auth/identity-token.guard";
import type { RequestIdentity } from "../../common/types/request-with-identity";
import { ProjectsService } from "./projects.service";

@Controller("projects")
export class AccountProjectsController {
  constructor(
    @Inject(ProjectsService)
    private readonly projectsService: ProjectsService,
  ) {}

  @Get("mine")
  @UseGuards(IdentityTokenGuard)
  findMine(@CurrentIdentity() identity: RequestIdentity) {
    return this.projectsService.findAllForUser(identity.userId);
  }
}
