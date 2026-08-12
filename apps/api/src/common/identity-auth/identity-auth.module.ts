import { Module } from "@nestjs/common";
import { IdentityTokenGuard } from "./identity-token.guard";
import { IdentityTokenService } from "./identity-token.service";

@Module({
    providers: [
        IdentityTokenGuard,
        IdentityTokenService,
    ],
    exports: [
        IdentityTokenGuard,
        IdentityTokenService,
    ],
})
export class IdentityAuthModule { }