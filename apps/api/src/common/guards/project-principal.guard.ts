import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { IdentityTokenService } from "../identity-auth/identity-token.service";
import { TokenService } from "../tokens/token.service";
import type { RequestWithProjectPrincipal } from "../types/request-with-project-principal";

@Injectable()
export class ProjectPrincipalGuard implements CanActivate {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(TokenService)
    private readonly tokenService: TokenService,
    @Inject(IdentityTokenService)
    private readonly identityTokenService: IdentityTokenService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithProjectPrincipal>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException("Token de acesso não informado.");
    }

    if (this.looksLikeJwt(token)) {
      const identity = await this.identityTokenService.verify(token);
      request.projectPrincipal = {
        type: "identity",
        userId: identity.userId,
      };
      return true;
    }

    const session = await this.prisma.session.findUnique({
      where: { tokenHash: this.tokenService.hashToken(token) },
      select: { id: true, revokedAt: true },
    });

    if (!session || session.revokedAt) {
      throw new UnauthorizedException("Sessão anônima inválida ou revogada.");
    }

    request.projectPrincipal = {
      type: "anonymous",
      sessionId: session.id,
    };

    await this.prisma.session.update({
      data: { lastSeenAt: new Date() },
      where: { id: session.id },
    });

    return true;
  }

  private looksLikeJwt(token: string) {
    return token.split(".").length === 3;
  }

  private extractBearerToken(request: RequestWithProjectPrincipal) {
    const authorization = request.headers.authorization;
    if (!authorization) return null;

    const [type, token, extra] = authorization.trim().split(/\s+/);
    if (type !== "Bearer" || !token || extra) return null;

    return token;
  }
}
