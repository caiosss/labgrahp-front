import {
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";
import { CurrentIdentity } from "../../common/identity-auth/current-identity.decorator";
import { IdentityTokenGuard } from "../../common/identity-auth/identity-token.guard";
import type { RequestIdentity } from "../../common/types/request-with-identity";

@Controller("sessions")
export class IdentityCheckController {
  @Get("identity-check")
  @UseGuards(IdentityTokenGuard)
  checkIdentity(
    @CurrentIdentity() identity: RequestIdentity,
  ) {
    return {
      authenticated: true,
      userId: identity.userId,
    };
  }
}