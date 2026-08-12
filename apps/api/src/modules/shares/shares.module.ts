import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { ProjectPrincipalGuard } from "../../common/guards/project-principal.guard";
import { IdentityAuthModule } from "../../common/identity-auth/identity-auth.module";
import { TokenService } from "../../common/tokens/token.service";
import { ProjectsRepository } from "../projects/projects.repository";
import { SharesController } from "./shares.controller";
import { SharesRepository } from "./shares.repository";
import { SharesService } from "./shares.service";

@Module({
  imports: [IdentityAuthModule],
  controllers: [SharesController],
  providers: [
    PrismaService,
    TokenService,
    ProjectPrincipalGuard,
    ProjectsRepository,
    SharesRepository,
    SharesService,
  ],
})
export class SharesModule {}
