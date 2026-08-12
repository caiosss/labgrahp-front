import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { IdentityTokenService } from "./identity-token.service";
import type { RequestWithIdentity } from "../types/request-with-identity";

@Injectable()
export class IdentityTokenGuard implements CanActivate {
    constructor(
        @Inject(IdentityTokenService)
        private readonly identityTokenService:
            IdentityTokenService,
    ) { }

    async canActivate(context: ExecutionContext) {
        const request =
            context.switchToHttp().getRequest<RequestWithIdentity>();

        const token = this.extractBearerToken(request);

        if (!token) {
            throw new UnauthorizedException(
                "Access token não informado.",
            );
        }

        request.identity =
            await this.identityTokenService.verify(token);

        return true;
    }

    private extractBearerToken(
        request: RequestWithIdentity,
    ) {
        const authorization = request.headers.authorization;

        if (!authorization) {
            return null;
        }

        const [type, token, extra] =
            authorization.trim().split(/\s+/);

        if (type !== "Bearer" || !token || extra) {
            return null;
        }

        return token;
    }
}
