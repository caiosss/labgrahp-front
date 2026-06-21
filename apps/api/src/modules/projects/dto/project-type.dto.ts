import { ProjectType } from "@prisma/client";

export const normalizeProjectType = (type: string) => {
  if (type === "chart") {
    return ProjectType.CHART;
  }

  if (type === "table") {
    return ProjectType.TABLE;
  }

  return type as ProjectType;
};

export const serializeProjectType = (type: ProjectType) => {
  if (type === ProjectType.CHART) {
    return "chart";
  }

  return "table";
};
