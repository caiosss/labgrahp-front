import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProjectDto } from "../types/project-dto";

interface ProjectStoreState {
    projects: ProjectDto[];
    upsertProject: (project: ProjectDto) => void;
    removeProject: (projectId: string) => void;
    getProjectById: (projectId: string) => ProjectDto | undefined;
}

export const useProjectStore = create<ProjectStoreState>()(
    persist(
        (set, get) => ({
            projects: [],
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
        }),
        {
            name: "labgraph-projects",
            storage: createJSONStorage(() => localStorage),
            version: 1,
        },
    ),
);
