import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { SessionTokenGuard } from "../../common/guards/session-token.guard";
import { TokenService } from "../../common/tokens/token.service";
import { SessionsController } from "./sessions.controller";
import { SessionsRepository } from "./sessions.repository";
import { SessionsService } from "./sessions.service";

@Module({
  controllers: [SessionsController],
  providers: [PrismaService, TokenService, SessionTokenGuard, SessionsRepository, SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
