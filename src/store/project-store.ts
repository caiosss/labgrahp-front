import { create } from "zustand";
import type { ChartDraftDto, ProjectDto, TableDraftDto } from "../types/project-dto";

interface ProjectStoreState {
    projects: ProjectDto[];
    chartDraft?: ChartDraftDto;
    tableDraft?: TableDraftDto;
    setProjects: (projects: ProjectDto[]) => void;
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
    chartDraft: undefined,
    tableDraft: undefined,
    setProjects: (projects) =>
        set({
            projects,
        }),
    upsertProject: (project) =>
        set((state) => {
            const projectExists = state.projects.some(
                (currentProject) => currentProject.id === project.id,
            );

            if (!projectExists) {
                return {
                    projects: [project, ...state.projects],
                };
            }

            return {
                projects: state.projects.map((currentProject) =>
                    currentProject.id === project.id ? project : currentProject,
                ),
            };
        }),
    removeProject: (projectId) =>
        set((state) => ({
            projects: state.projects.filter((project) => project.id !== projectId),
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
