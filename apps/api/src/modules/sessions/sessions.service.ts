import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { TokenService } from "../../common/tokens/token.service";
import { SessionsRepository } from "./sessions.repository";
import type { SessionResponseDto } from "./dto/session-response.dto";

@Injectable()
export class SessionsService {
  constructor(
    @Inject(SessionsRepository)
    private readonly sessionsRepository: SessionsRepository,
    @Inject(TokenService)
    private readonly tokenService: TokenService,
  ) {}

  async createAnonymousSession(): Promise<SessionResponseDto> {
    const token = this.tokenService.createSessionToken();
    const tokenHash = this.tokenService.hashToken(token);
    const session = await this.sessionsRepository.create(tokenHash);

    return {
      sessionId: session.id,
      token,
      createdAt: session.createdAt.toISOString(),
    };
  }

  async getCurrentSession(sessionId: string) {
    const session = await this.sessionsRepository.findById(sessionId);

    if (!session) {
      throw new NotFoundException("Sessão não encontrada.");
    }

    return {
      sessionId: session.id,
      createdAt: session.createdAt.toISOString(),
      lastSeenAt: session.lastSeenAt.toISOString(),
    };
  }
}
