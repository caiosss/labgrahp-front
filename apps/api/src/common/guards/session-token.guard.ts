import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { TokenService } from "../tokens/token.service";
import type { RequestWithSession } from "../types/request-with-session";

@Injectable()
export class SessionTokenGuard implements CanActivate {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(TokenService)
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException("Token de sessão não informado.");
    }

    const tokenHash = this.tokenService.hashToken(token);
    const session = await this.prisma.session.findUnique({
      where: {
        tokenHash,
      },
      select: {
        id: true,
        revokedAt: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException("Sessão inválida.");
    }

    if (session.revokedAt) {
      throw new UnauthorizedException("Sessão revogada.");
    }

    request.session = {
      id: session.id,
    };

    await this.prisma.session.update({
      data: {
        lastSeenAt: new Date(),
      },
      where: {
        id: session.id,
      },
    });

    return true;
  }

  private extractBearerToken(request: RequestWithSession) {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(" ");

    if (type !== "Bearer") {
      return null;
    }

    if (!token) {
      return null;
    }

    return token;
  }
}
