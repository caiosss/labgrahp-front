import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { SessionTokenGuard } from "../../common/guards/session-token.guard";
import { TokenService } from "../../common/tokens/token.service";
import { SessionsController } from "./sessions.controller";
import { SessionsRepository } from "./sessions.repository";
import { SessionsService } from "./sessions.service";
import { IdentityAuthModule } from "../../common/identity-auth/identity-auth.module";
import { IdentityCheckController } from "./identity-check.controller";

@Module({
  imports: [IdentityAuthModule],
  controllers: [
    IdentityCheckController,
    SessionsController,
  ],
  providers: [
    PrismaService,
    TokenService,
    SessionTokenGuard,
    SessionsRepository,
    SessionsService,
  ],
})
export class SessionsModule { }
