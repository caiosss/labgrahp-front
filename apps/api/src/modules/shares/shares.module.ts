import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { SessionTokenGuard } from "../../common/guards/session-token.guard";
import { TokenService } from "../../common/tokens/token.service";
import { ProjectsRepository } from "../projects/projects.repository";
import { SharesController } from "./shares.controller";
import { SharesRepository } from "./shares.repository";
import { SharesService } from "./shares.service";

@Module({
  controllers: [SharesController],
  providers: [
    PrismaService,
    TokenService,
    SessionTokenGuard,
    ProjectsRepository,
    SharesRepository,
    SharesService,
  ],
})
export class SharesModule {}
