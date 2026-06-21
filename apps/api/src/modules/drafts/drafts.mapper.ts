import type { Draft } from "@prisma/client";
import { serializeProjectType } from "../projects/dto/project-type.dto";

export const toDraftResponse = (draft: Draft) => {
  return {
    id: draft.id,
    type: `${serializeProjectType(draft.type)}-draft`,
    projectId: draft.projectId ?? undefined,
    schemaVersion: draft.schemaVersion,
    data: draft.data,
    createdAt: draft.createdAt.toISOString(),
    updatedAt: draft.updatedAt.toISOString(),
  };
};
