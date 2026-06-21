import { Body, Controller, Delete, Get, Inject, Param, Put, UseGuards } from "@nestjs/common";
import { CurrentSession } from "../../common/decorators/current-session.decorator";
import { SessionTokenGuard } from "../../common/guards/session-token.guard";
import type { RequestSession } from "../../common/types/request-with-session";
import { UpsertDraftDto } from "./dto/upsert-draft.dto";
import { DraftsService } from "./drafts.service";

@Controller("drafts")
@UseGuards(SessionTokenGuard)
export class DraftsController {
  constructor(
    @Inject(DraftsService)
    private readonly draftsService: DraftsService,
  ) {}

  @Get(":type")
  findOne(
    @CurrentSession() session: RequestSession,
    @Param("type") type: string,
  ) {
    return this.draftsService.findOne(session.id, type);
  }

  @Put(":type")
  upsert(
    @CurrentSession() session: RequestSession,
    @Param("type") type: string,
    @Body() dto: UpsertDraftDto,
  ) {
    return this.draftsService.upsert(session.id, type, dto);
  }

  @Delete(":type")
  remove(
    @CurrentSession() session: RequestSession,
    @Param("type") type: string,
  ) {
    return this.draftsService.remove(session.id, type);
  }
}
