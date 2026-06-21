import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { SessionTokenGuard } from "../../common/guards/session-token.guard";
import { TokenService } from "../../common/tokens/token.service";
import { DraftsController } from "./drafts.controller";
import { DraftsRepository } from "./drafts.repository";
import { DraftsService } from "./drafts.service";

@Module({
  controllers: [DraftsController],
  providers: [PrismaService, TokenService, SessionTokenGuard, DraftsRepository, DraftsService],
})
export class DraftsModule {}
