import { Body, Controller, Delete, Get, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentProjectPrincipal } from "../../common/decorators/current-project-principal.decorator";
import { ProjectPrincipalGuard } from "../../common/guards/project-principal.guard";
import type { ProjectPrincipal } from "../../common/types/project-principal";
import { CreateShareDto } from "./dto/create-share.dto";
import { SharesService } from "./shares.service";

@Controller()
export class SharesController {
  constructor(
    @Inject(SharesService)
    private readonly sharesService: SharesService,
  ) {}

  @Post("projects/:projectId/share")
  @UseGuards(ProjectPrincipalGuard)
  createShare(
    @CurrentProjectPrincipal() principal: ProjectPrincipal,
    @Param("projectId") projectId: string,
    @Body() dto: CreateShareDto,
  ) {
    return this.sharesService.createShare(principal, projectId, dto);
  }

  @Delete("projects/:projectId/share")
  @UseGuards(ProjectPrincipalGuard)
  revokeProjectShares(
    @CurrentProjectPrincipal() principal: ProjectPrincipal,
    @Param("projectId") projectId: string,
  ) {
    return this.sharesService.revokeProjectShares(principal, projectId);
  }

  @Get("shares/:token")
  findSharedProject(@Param("token") token: string) {
    return this.sharesService.findSharedProject(token);
  }
}
