import type { ChartConfig } from "./chart";
import type { AbntTableConfig } from "./table";

export type ProjectType = "chart" | "table";

export interface BaseProjectDto {
    id: string;
    type: ProjectType;
    name: string;
    schemaVersion: 1;
    createdAt: string;
    updatedAt: string;
}

export interface ChartProjectDto extends BaseProjectDto {
    type: "chart";
    chart: ChartConfig;
}

export interface TableProjectDto extends BaseProjectDto {
    type: "table";
    table: AbntTableConfig;
}

export type ProjectDto = ChartProjectDto | TableProjectDto;
