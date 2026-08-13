import { create } from "zustand";
import type { ChartDraftDto, ProjectDto, TableDraftDto } from "../types/project-dto";

interface ProjectStoreState {
    projects: ProjectDto[];
    locallyDeletedProjectIds: string[];
    chartDraft?: ChartDraftDto;
    tableDraft?: TableDraftDto;
    setProjects: (projects: ProjectDto[]) => void;
    mergeProjects: (projects: ProjectDto[]) => void;
    upsertProject: (project: ProjectDto) => void;
    removeProject: (projectId: string) => void;
    getProjectById: (projectId: string) => ProjectDto | undefined;
    setChartDraft: (draft: ChartDraftDto) => void;
    setTableDraft: (draft: TableDraftDto) => void;
    clearChartDraft: () => void;
    clearTableDraft: () => void;
}

export const useProjectStore = create<ProjectStoreState>()((set, get) => ({
    projects: [],
    locallyDeletedProjectIds: [],
    chartDraft: undefined,
    tableDraft: undefined,
    setProjects: (projects) =>
        set((state) => ({
            projects: projects.filter(
                (project) => !state.locallyDeletedProjectIds.includes(project.id),
            ),
        })),
    mergeProjects: (projects) =>
        set((state) => {
            const projectMap = new Map<string, ProjectDto>();

            state.projects.forEach((project) => {
                if (!state.locallyDeletedProjectIds.includes(project.id)) {
                    projectMap.set(project.id, project);
                }
            });

            projects.forEach((project) => {
                if (!state.locallyDeletedProjectIds.includes(project.id)) {
                    projectMap.set(project.id, project);
                }
            });

            return {
                projects: Array.from(projectMap.values()).sort(
                    (firstProject, secondProject) =>
                        new Date(secondProject.updatedAt).getTime() -
                        new Date(firstProject.updatedAt).getTime(),
                ),
            };
        }),
    upsertProject: (project) =>
        set((state) => {
            const projectExists = state.projects.some(
                (currentProject) => currentProject.id === project.id,
            );

            if (!projectExists) {
                return {
                    projects: [project, ...state.projects],
                    locallyDeletedProjectIds:
                        state.locallyDeletedProjectIds.filter(
                            (projectId) => projectId !== project.id,
                        ),
                };
            }

            return {
                projects: state.projects.map((currentProject) =>
                    currentProject.id === project.id ? project : currentProject,
                ),
                locallyDeletedProjectIds: state.locallyDeletedProjectIds.filter(
                    (projectId) => projectId !== project.id,
                ),
            };
        }),
    removeProject: (projectId) =>
        set((state) => ({
            projects: state.projects.filter((project) => project.id !== projectId),
            locallyDeletedProjectIds: state.locallyDeletedProjectIds.includes(
                projectId,
            )
                ? state.locallyDeletedProjectIds
                : [projectId, ...state.locallyDeletedProjectIds],
        })),
    getProjectById: (projectId) =>
        get().projects.find((project) => project.id === projectId),
    setChartDraft: (draft) =>
        set({
            chartDraft: draft,
        }),
    setTableDraft: (draft) =>
        set({
            tableDraft: draft,
        }),
    clearChartDraft: () =>
        set({
            chartDraft: undefined,
        }),
    clearTableDraft: () =>
        set({
            tableDraft: undefined,
        }),
}));
