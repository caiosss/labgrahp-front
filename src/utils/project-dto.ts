import type { ChartConfig } from "../types/chart";
import type { ChartDraftDto, ProjectDto, TableDraftDto } from "../types/project-dto";
import type { AbntTableConfig } from "../types/table";
import { createRandomUUID } from "./create-random-uuid";

const cloneConfig = <T,>(config: T): T => {
    if (typeof structuredClone === "function") {
        return structuredClone(config);
    }

    return JSON.parse(JSON.stringify(config)) as T;
};

export const createChartProjectDto = (
    chart: ChartConfig,
    currentProject?: ProjectDto,
): ProjectDto => {
    const now = new Date().toISOString();
    const isChartProject = currentProject?.type === "chart";

    return {
        id: isChartProject ? currentProject.id : createRandomUUID(),
        type: "chart",
        name: chart.title.trim() || "Grafico sem título",
        schemaVersion: 1,
        createdAt: isChartProject ? currentProject.createdAt : now,
        updatedAt: now,
        chart: cloneConfig(chart),
    };
};

export const createTableProjectDto = (
    table: AbntTableConfig,
    currentProject?: ProjectDto,
): ProjectDto => {
    const now = new Date().toISOString();
    const isTableProject = currentProject?.type === "table";

    return {
        id: isTableProject ? currentProject.id : createRandomUUID(),
        type: "table",
        name: table.title.trim() || "Tabela sem título",
        schemaVersion: 1,
        createdAt: isTableProject ? currentProject.createdAt : now,
        updatedAt: now,
        table: cloneConfig(table),
    };
};

export const createChartDraftDto = (
    chart: ChartConfig,
    currentDraft?: ChartDraftDto,
    projectId?: string,
): ChartDraftDto => {
    return {
        id: currentDraft?.id ?? createRandomUUID(),
        type: "chart-draft",
        projectId,
        schemaVersion: 1,
        updatedAt: new Date().toISOString(),
        chart: cloneConfig(chart),
    };
};

export const createTableDraftDto = (
    table: AbntTableConfig,
    currentDraft?: TableDraftDto,
    projectId?: string,
): TableDraftDto => {
    return {
        id: currentDraft?.id ?? createRandomUUID(),
        type: "table-draft",
        projectId,
        schemaVersion: 1,
        updatedAt: new Date().toISOString(),
        table: cloneConfig(table),
    };
};

export const cloneProjectConfig = cloneConfig;
