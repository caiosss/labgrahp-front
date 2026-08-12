import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentSession } from "../../common/decorators/current-session.decorator";
import { SessionTokenGuard } from "../../common/guards/session-token.guard";
import type { RequestSession } from "../../common/types/request-with-session";
import { SessionsService } from "./sessions.service";
import { CurrentIdentity } from "../../common/identity-auth/current-identity.decorator";
import { IdentityTokenGuard } from "../../common/identity-auth/identity-token.guard";
import type { RequestIdentity } from "../../common/types/request-with-identity";
import { ClaimProjectsDto } from "./dto/claim-projects.dto";

@Controller("sessions")
export class SessionsController {
  constructor(
    @Inject(SessionsService)
    private readonly sessionsService: SessionsService,
  ) { }

  @Post()
  createAnonymousSession() {
    return this.sessionsService.createAnonymousSession();
  }

  @Get("current")
  @UseGuards(SessionTokenGuard)
  getCurrentSession(@CurrentSession() session: RequestSession) {
    return this.sessionsService.getCurrentSession(session.id);
  }

  @Post("claim-projects")
  @HttpCode(200)
  @UseGuards(IdentityTokenGuard)
  claimProjects(
    @CurrentIdentity() identity: RequestIdentity,
    @Body() dto: ClaimProjectsDto,
  ) {
    return this.sessionsService.claimAnonymousProjects(
      identity.userId,
      dto.anonymousToken,
    );
  }
}
