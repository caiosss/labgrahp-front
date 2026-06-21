import type { Project } from "@prisma/client";
import { serializeProjectType } from "./dto/project-type.dto";

export const toProjectResponse = (project: Project) => {
  return {
    id: project.id,
    type: serializeProjectType(project.type),
    name: project.name,
    schemaVersion: project.schemaVersion,
    data: project.data,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
};
