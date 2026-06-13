import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { OnboardingTourId } from "../types/onboarding";
import type { ChartDraftDto, ProjectDto } from "../types/project-dto";

interface ProjectStoreState {
    projects: ProjectDto[];
    chartDraft?: ChartDraftDto;
    onboarding: {
        seenTours: Partial<Record<OnboardingTourId, boolean>>;
    };
    upsertProject: (project: ProjectDto) => void;
    removeProject: (projectId: string) => void;
    getProjectById: (projectId: string) => ProjectDto | undefined;
    setChartDraft: (draft: ChartDraftDto) => void;
    clearChartDraft: () => void;
    setOnboardingTourSeen: (tourId: OnboardingTourId, seen?: boolean) => void;
}

export const useProjectStore = create<ProjectStoreState>()(
    persist(
        (set, get) => ({
            projects: [],
            chartDraft: undefined,
            onboarding: {
                seenTours: {},
            },
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
            clearChartDraft: () =>
                set({
                    chartDraft: undefined,
                }),
            setOnboardingTourSeen: (tourId, seen = true) =>
                set((state) => ({
                    onboarding: {
                        ...(state.onboarding ?? { seenTours: {} }),
                        seenTours: {
                            ...(state.onboarding?.seenTours ?? {}),
                            [tourId]: seen,
                        },
                    },
                })),
        }),
        {
            name: "labgraph-projects",
            storage: createJSONStorage(() => localStorage),
            version: 1,
        },
    ),
);
