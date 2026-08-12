import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { ProjectPrincipalGuard } from "../../common/guards/project-principal.guard";
import { IdentityAuthModule } from "../../common/identity-auth/identity-auth.module";
import { TokenService } from "../../common/tokens/token.service";
import { ProjectsController } from "./projects.controller";
import { ProjectsRepository } from "./projects.repository";
import { ProjectsService } from "./projects.service";

@Module({
  imports: [IdentityAuthModule],
  controllers: [ProjectsController],
  providers: [
    PrismaService,
    TokenService,
    ProjectPrincipalGuard,
    ProjectsRepository,
    ProjectsService,
  ],
  exports: [ProjectsRepository, ProjectsService],
})
export class ProjectsModule {}
