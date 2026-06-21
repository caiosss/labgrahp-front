import { Body, Controller, Delete, Get, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentSession } from "../../common/decorators/current-session.decorator";
import { SessionTokenGuard } from "../../common/guards/session-token.guard";
import type { RequestSession } from "../../common/types/request-with-session";
import { CreateShareDto } from "./dto/create-share.dto";
import { SharesService } from "./shares.service";

@Controller()
export class SharesController {
  constructor(
    @Inject(SharesService)
    private readonly sharesService: SharesService,
  ) {}

  @Post("projects/:projectId/share")
  @UseGuards(SessionTokenGuard)
  createShare(
    @CurrentSession() session: RequestSession,
    @Param("projectId") projectId: string,
    @Body() dto: CreateShareDto,
  ) {
    return this.sharesService.createShare(session.id, projectId, dto);
  }

  @Delete("projects/:projectId/share")
  @UseGuards(SessionTokenGuard)
  revokeProjectShares(
    @CurrentSession() session: RequestSession,
    @Param("projectId") projectId: string,
  ) {
    return this.sharesService.revokeProjectShares(session.id, projectId);
  }

  @Get("shares/:token")
  findSharedProject(@Param("token") token: string) {
    return this.sharesService.findSharedProject(token);
  }
}
