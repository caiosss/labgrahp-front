import type { SharedProjectShareDto } from "../../packages/shared/src";
import type { ProjectDto } from "../types/project-dto";
import type { ChartConfig } from "../types/chart";
import type { AbntTableConfig } from "../types/table";
import { apiRequest } from "./api-client";

type ApiProjectShareDto = SharedProjectShareDto<Record<string, unknown>>;

const toProjectDto = (share: ApiProjectShareDto): ProjectDto => {
    const project = share.project;

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

export const createProjectShare = async (projectId: string) => {
    const share = await apiRequest<ApiProjectShareDto>(
        `/projects/${projectId}/share`,
        {
            body: JSON.stringify({
                permission: "read",
            }),
            method: "POST",
        },
    );

    return share;
};

export const revokeProjectShares = (projectId: string) => {
    return apiRequest<{ revoked: boolean }>(`/projects/${projectId}/share`, {
        method: "DELETE",
    });
};

export const fetchSharedProject = async (shareToken: string) => {
    const share = await apiRequest<ApiProjectShareDto>(`/shares/${shareToken}`, {
        authenticated: false,
    });

    return {
        ...share,
        project: toProjectDto(share),
    };
};
