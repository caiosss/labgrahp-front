import type { SharedDraftDto, SharedProjectDto } from "../../packages/shared/src";
import type { ChartDraftDto, ProjectDto, TableDraftDto } from "../types/project-dto";
import type { ChartConfig } from "../types/chart";
import type { AbntTableConfig } from "../types/table";
import { ApiError, apiRequest } from "./api-client";
import { getStoredAccessToken } from "./auth-session-storage";
import { logClientError } from "./client-logger";
import {
    getPendingProjects,
    mergeProjectsWithPendingProjects,
    removePendingProject,
    savePendingProject,
} from "./local-project-cache";

type ApiProjectDto = SharedProjectDto<Record<string, unknown>>;
type ApiDraftDto = SharedDraftDto<Record<string, unknown>>;

export interface SaveProjectResult {
    message?: string;
    persistedIn: "api" | "local";
    project: ProjectDto;
}

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

const getProjectWithFreshTimestamp = (project: ProjectDto): ProjectDto => ({
    ...project,
    updatedAt: new Date().toISOString(),
});

const saveProjectToRemote = async (project: ProjectDto) => {
    const savedProject = await apiRequest<ApiProjectDto>(`/projects/${project.id}`, {
        authentication: "identity-or-anonymous",
        body: JSON.stringify(toApiProjectPayload(project)),
        method: "PUT",
    });

    return toProjectDto(savedProject);
};

const getSaveFailureMessage = (error: unknown) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return "Falha ao comunicar com a API.";
};

const canUseLocalFallback = (error: unknown) => {
    // Rede e indisponibilidade temporária podem ser sincronizadas depois.
    // Erros de autenticação, permissão e validação não devem ser mascarados.
    return !(error instanceof ApiError) || error.status >= 500;
};

const syncPendingProjects = async () => {
    const pendingProjects = getPendingProjects();
    const syncedProjects: ProjectDto[] = [];

    for (const project of pendingProjects) {
        try {
            const savedProject = await saveProjectToRemote(project);

            removePendingProject(project.id);
            syncedProjects.push(savedProject);
        } catch (error) {
            logClientError("project-sync-pending", error, {
                projectId: project.id,
                projectType: project.type,
            });
        }
    }

    return syncedProjects;
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
    try {
        await syncPendingProjects();

        const isAuthenticated = Boolean(getStoredAccessToken());

        const projects = await apiRequest<ApiProjectDto[]>(
            isAuthenticated ? "/projects/mine" : "/projects",
            {
                authentication: isAuthenticated ? "identity" : "anonymous",
            },
        );

        return mergeProjectsWithPendingProjects(projects.map(toProjectDto));
    } catch (error) {
        logClientError("project-fetch", error);

        if (!canUseLocalFallback(error)) {
            throw error;
        }

        return mergeProjectsWithPendingProjects([]);
    }
};

export const saveProjectToApi = async (
    project: ProjectDto,
): Promise<SaveProjectResult> => {
    const projectToSave = getProjectWithFreshTimestamp(project);

    try {
        const savedProject = await saveProjectToRemote(projectToSave);

        removePendingProject(project.id);

        return {
            persistedIn: "api",
            project: savedProject,
        };
    } catch (error) {
        if (!canUseLocalFallback(error)) {
            throw error;
        }

        const message = getSaveFailureMessage(error);
        const savedLocally = savePendingProject(projectToSave, message);

        logClientError("project-save-fallback", error, {
            fallback: savedLocally ? "local" : "failed",
            projectId: project.id,
            projectType: project.type,
        });

        if (savedLocally) {
            return {
                message:
                    "Salvo neste dispositivo. A sincronização será feita quando a API voltar.",
                persistedIn: "local",
                project: projectToSave,
            };
        }

        throw error;
    }
};

export const deleteProjectFromApi = (projectId: string) => {
    return apiRequest<{ removed: boolean }>(`/projects/${projectId}`, {
        authentication: "identity-or-anonymous",
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
