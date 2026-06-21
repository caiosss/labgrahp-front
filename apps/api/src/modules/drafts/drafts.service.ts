import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { Prisma, ProjectType } from "@prisma/client";
import { normalizeProjectType } from "../projects/dto/project-type.dto";
import type { UpsertDraftDto } from "./dto/upsert-draft.dto";
import { toDraftResponse } from "./drafts.mapper";
import { DraftsRepository } from "./drafts.repository";

@Injectable()
export class DraftsService {
  constructor(
    @Inject(DraftsRepository)
    private readonly draftsRepository: DraftsRepository,
  ) {}

  async findOne(sessionId: string, typeParam: string) {
    const type = this.parseDraftType(typeParam);
    const draft = await this.draftsRepository.findBySessionAndType(sessionId, type);

    if (!draft) {
      return null;
    }

    return toDraftResponse(draft);
  }

  async upsert(sessionId: string, typeParam: string, dto: UpsertDraftDto) {
    const type = this.parseDraftType(typeParam);
    const draft = await this.draftsRepository.upsert({
      data: dto.data as Prisma.InputJsonValue,
      projectId: dto.projectId,
      schemaVersion: dto.schemaVersion ?? 1,
      sessionId,
      type,
    });

    return toDraftResponse(draft);
  }

  async remove(sessionId: string, typeParam: string) {
    const type = this.parseDraftType(typeParam);
    await this.draftsRepository.deleteBySessionAndType(sessionId, type);

    return {
      removed: true,
    };
  }

  private parseDraftType(typeParam: string): ProjectType {
    if (typeParam !== "chart" && typeParam !== "table") {
      throw new BadRequestException("Tipo de rascunho inválido.");
    }

    return normalizeProjectType(typeParam);
  }
}
