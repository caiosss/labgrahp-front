import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { TokenService } from "../../common/tokens/token.service";
import { ProjectsRepository } from "../projects/projects.repository";
import { toProjectResponse } from "../projects/projects.mapper";
import type { CreateShareDto } from "./dto/create-share.dto";
import { normalizeSharePermission, serializeSharePermission } from "./dto/share-permission.dto";
import { SharesRepository } from "./shares.repository";

@Injectable()
export class SharesService {
  constructor(
    @Inject(ProjectsRepository)
    private readonly projectsRepository: ProjectsRepository,
    @Inject(SharesRepository)
    private readonly sharesRepository: SharesRepository,
    @Inject(TokenService)
    private readonly tokenService: TokenService,
  ) {}

  async createShare(sessionId: string, projectId: string, dto: CreateShareDto) {
    const project = await this.projectsRepository.findOwnedProject(
      sessionId,
      projectId,
    );

    if (!project) {
      throw new NotFoundException("Projeto não encontrado.");
    }

    const token = this.tokenService.createShareToken();
    const tokenHash = this.tokenService.hashToken(token);
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
    const permission = normalizeSharePermission(dto.permission);
    const share = await this.sharesRepository.create({
      expiresAt,
      permission,
      projectId,
      tokenHash,
    });

    return {
      id: share.id,
      token,
      permission: serializeSharePermission(share.permission),
      expiresAt: share.expiresAt?.toISOString(),
      project: toProjectResponse(share.project),
    };
  }

  async findSharedProject(token: string) {
    const tokenHash = this.tokenService.hashToken(token);
    const share = await this.sharesRepository.findActiveByTokenHash(tokenHash);

    if (!share) {
      throw new NotFoundException("Compartilhamento não encontrado.");
    }

    if (share.revokedAt) {
      throw new ForbiddenException("Compartilhamento revogado.");
    }

    if (share.expiresAt && share.expiresAt.getTime() < Date.now()) {
      throw new ForbiddenException("Compartilhamento expirado.");
    }

    if (share.project.deletedAt) {
      throw new NotFoundException("Projeto compartilhado não encontrado.");
    }

    return {
      id: share.id,
      permission: serializeSharePermission(share.permission),
      expiresAt: share.expiresAt?.toISOString(),
      project: toProjectResponse(share.project),
    };
  }

  async revokeProjectShares(sessionId: string, projectId: string) {
    const project = await this.projectsRepository.findOwnedProject(
      sessionId,
      projectId,
    );

    if (!project) {
      throw new NotFoundException("Projeto não encontrado.");
    }

    await this.sharesRepository.revokeByProject(projectId);

    return {
      revoked: true,
    };
  }
}
