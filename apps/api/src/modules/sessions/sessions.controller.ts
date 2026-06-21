import { Controller, Get, Inject, Post, UseGuards } from "@nestjs/common";
import { CurrentSession } from "../../common/decorators/current-session.decorator";
import { SessionTokenGuard } from "../../common/guards/session-token.guard";
import type { RequestSession } from "../../common/types/request-with-session";
import { SessionsService } from "./sessions.service";

@Controller("sessions")
export class SessionsController {
  constructor(
    @Inject(SessionsService)
    private readonly sessionsService: SessionsService,
  ) {}

  @Post()
  createAnonymousSession() {
    return this.sessionsService.createAnonymousSession();
  }

  @Get("current")
  @UseGuards(SessionTokenGuard)
  getCurrentSession(@CurrentSession() session: RequestSession) {
    return this.sessionsService.getCurrentSession(session.id);
  }
}
