export type OnboardingTourId = "chart-editor" | "table-editor";

export interface OnboardingStep {
    target: string;
    title: string;
    description: string;
    example?: string;
}
