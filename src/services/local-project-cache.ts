import type { ProjectDto } from "../types/project-dto";
import { logClientError } from "./client-logger";

const PENDING_PROJECTS_KEY = "labgraph-pending-projects";
const DELETED_PROJECTS_KEY = "labgraph-deleted-projects";

export interface PendingProjectDto {
    project: ProjectDto;
    reason?: string;
    savedLocallyAt: string;
}

const readPendingProjectEntries = (): PendingProjectDto[] => {
    try {
        const storedProjects = window.localStorage.getItem(PENDING_PROJECTS_KEY);

        if (!storedProjects) {
            return [];
        }

        const parsedProjects = JSON.parse(storedProjects);

        if (!Array.isArray(parsedProjects)) {
            return [];
        }

        return parsedProjects as PendingProjectDto[];
    } catch (error) {
        logClientError("local-project-cache-read", error);

        return [];
    }
};

const writePendingProjectEntries = (entries: PendingProjectDto[]) => {
    window.localStorage.setItem(PENDING_PROJECTS_KEY, JSON.stringify(entries));
};

const readDeletedProjectIds = () => {
    try {
        const storedIds = window.localStorage.getItem(DELETED_PROJECTS_KEY);

        if (!storedIds) return [];

        const parsedIds = JSON.parse(storedIds);

        return Array.isArray(parsedIds)
            ? parsedIds.filter((id): id is string => typeof id === "string")
            : [];
    } catch (error) {
        logClientError("local-project-deletions-read", error);
        return [];
    }
};

const writeDeletedProjectIds = (projectIds: string[]) => {
    window.localStorage.setItem(
        DELETED_PROJECTS_KEY,
        JSON.stringify(projectIds.slice(0, 200)),
    );
};

export const restoreProjectLocally = (projectId: string) => {
    try {
        writeDeletedProjectIds(
            readDeletedProjectIds().filter((currentId) => currentId !== projectId),
        );
    } catch (error) {
        logClientError("local-project-deletion-clear", error, { projectId });
    }
};

export const getPendingProjects = () =>
    readPendingProjectEntries().map((entry) => entry.project);

export const savePendingProject = (project: ProjectDto, reason?: string) => {
    const entries = readPendingProjectEntries();
    const nextEntry: PendingProjectDto = {
        project,
        reason,
        savedLocallyAt: new Date().toISOString(),
    };
    const nextEntries = [
        nextEntry,
        ...entries.filter((entry) => entry.project.id !== project.id),
    ];

    try {
        restoreProjectLocally(project.id);
        writePendingProjectEntries(nextEntries);

        return true;
    } catch (error) {
        logClientError("local-project-cache-write", error, {
            projectId: project.id,
            projectType: project.type,
        });

        return false;
    }
};

export const markProjectAsDeletedLocally = (projectId: string) => {
    removePendingProject(projectId);

    try {
        const deletedProjectIds = readDeletedProjectIds();

        if (!deletedProjectIds.includes(projectId)) {
            writeDeletedProjectIds([projectId, ...deletedProjectIds]);
        }
    } catch (error) {
        logClientError("local-project-deletion-write", error, { projectId });
    }
};

export const removePendingProject = (projectId: string) => {
    const entries = readPendingProjectEntries();

    try {
        writePendingProjectEntries(
            entries.filter((entry) => entry.project.id !== projectId),
        );
    } catch (error) {
        logClientError("local-project-cache-remove", error, {
            projectId,
        });
    }
};

export const mergeProjectsWithPendingProjects = (projects: ProjectDto[]) => {
    const projectMap = new Map<string, ProjectDto>();
    const deletedProjectIds = new Set(readDeletedProjectIds());

    projects.forEach((project) => {
        if (!deletedProjectIds.has(project.id)) {
            projectMap.set(project.id, project);
        }
    });

    getPendingProjects().forEach((project) => {
        if (!deletedProjectIds.has(project.id)) {
            projectMap.set(project.id, project);
        }
    });

    return Array.from(projectMap.values()).sort(
        (firstProject, secondProject) =>
            new Date(secondProject.updatedAt).getTime() -
            new Date(firstProject.updatedAt).getTime(),
    );
};
