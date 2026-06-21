import type { SharedDraftDto, SharedProjectDto } from "../../packages/shared/src";
import type { ChartDraftDto, ProjectDto, TableDraftDto } from "../types/project-dto";
import type { ChartConfig } from "../types/chart";
import type { AbntTableConfig } from "../types/table";
import { apiRequest } from "./api-client";

type ApiProjectDto = SharedProjectDto<Record<string, unknown>>;
type ApiDraftDto = SharedDraftDto<Record<string, unknown>>;

const toProjectDto = (project: ApiProjectDto): ProjectDto => {
    if (project.type === "chart") {
        return {
            id: project.id,
            type: "chart",
            name: project.name,
            schemaVersion: 1,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            chart: project.data as unknown as ChartConfig,
        };
    }

    return {
        id: project.id,
        type: "table",
        name: project.name,
        schemaVersion: 1,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        table: project.data as unknown as AbntTableConfig,
    };
};

const toApiProjectPayload = (project: ProjectDto) => {
    if (project.type === "chart") {
        return {
            type: project.type,
            name: project.name,
            schemaVersion: project.schemaVersion,
            data: project.chart as unknown as Record<string, unknown>,
        };
    }

    return {
        type: project.type,
        name: project.name,
        schemaVersion: project.schemaVersion,
        data: project.table as unknown as Record<string, unknown>,
    };
};

const toChartDraftDto = (draft: ApiDraftDto): ChartDraftDto => {
    return {
        id: draft.id,
        type: "chart-draft",
        projectId: draft.projectId,
        schemaVersion: 1,
        updatedAt: draft.updatedAt,
        chart: draft.data as unknown as ChartConfig,
    };
};

const toTableDraftDto = (draft: ApiDraftDto): TableDraftDto => {
    return {
        id: draft.id,
        type: "table-draft",
        projectId: draft.projectId,
        schemaVersion: 1,
        updatedAt: draft.updatedAt,
        table: draft.data as unknown as AbntTableConfig,
    };
};

export const fetchProjects = async () => {
    const projects = await apiRequest<ApiProjectDto[]>("/projects");

    return projects.map(toProjectDto);
};

export const saveProjectToApi = async (project: ProjectDto) => {
    const savedProject = await apiRequest<ApiProjectDto>(`/projects/${project.id}`, {
        body: JSON.stringify(toApiProjectPayload(project)),
        method: "PUT",
    });

    return toProjectDto(savedProject);
};

export const deleteProjectFromApi = (projectId: string) => {
    return apiRequest<{ removed: boolean }>(`/projects/${projectId}`, {
        method: "DELETE",
    });
};

export const fetchChartDraft = async () => {
    const draft = await apiRequest<ApiDraftDto | null>("/drafts/chart");

    if (!draft) {
        return undefined;
    }

    return toChartDraftDto(draft);
};

export const fetchTableDraft = async () => {
    const draft = await apiRequest<ApiDraftDto | null>("/drafts/table");

    if (!draft) {
        return undefined;
    }

    return toTableDraftDto(draft);
};

export const saveChartDraftToApi = async (draft: ChartDraftDto) => {
    const savedDraft = await apiRequest<ApiDraftDto>("/drafts/chart", {
        body: JSON.stringify({
            data: draft.chart,
            projectId: draft.projectId,
            schemaVersion: draft.schemaVersion,
        }),
        method: "PUT",
    });

    return toChartDraftDto(savedDraft);
};

export const saveTableDraftToApi = async (draft: TableDraftDto) => {
    const savedDraft = await apiRequest<ApiDraftDto>("/drafts/table", {
        body: JSON.stringify({
            data: draft.table,
            projectId: draft.projectId,
            schemaVersion: draft.schemaVersion,
        }),
        method: "PUT",
    });

    return toTableDraftDto(savedDraft);
};

export const deleteChartDraftFromApi = () => {
    return apiRequest<{ removed: boolean }>("/drafts/chart", {
        method: "DELETE",
    });
};

export const deleteTableDraftFromApi = () => {
    return apiRequest<{ removed: boolean }>("/drafts/table", {
        method: "DELETE",
    });
};
