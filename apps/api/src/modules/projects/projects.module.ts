import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { SessionTokenGuard } from "../../common/guards/session-token.guard";
import { TokenService } from "../../common/tokens/token.service";
import { ProjectsController } from "./projects.controller";
import { ProjectsRepository } from "./projects.repository";
import { ProjectsService } from "./projects.service";

@Module({
  controllers: [ProjectsController],
  providers: [PrismaService, TokenService, SessionTokenGuard, ProjectsRepository, ProjectsService],
  exports: [ProjectsRepository, ProjectsService],
})
export class ProjectsModule {}
