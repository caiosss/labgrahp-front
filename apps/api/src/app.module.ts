import { Module } from "@nestjs/common";
import { PrismaService } from "./common/database/prisma.service";
import { TokenService } from "./common/tokens/token.service";
import { DraftsModule } from "./modules/drafts/drafts.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { SessionsModule } from "./modules/sessions/sessions.module";
import { SharesModule } from "./modules/shares/shares.module";
import { AppController } from "./app.controller";

@Module({
  imports: [SessionsModule, ProjectsModule, DraftsModule, SharesModule],
  controllers: [AppController],
  providers: [PrismaService, TokenService],
})
export class AppModule {}
