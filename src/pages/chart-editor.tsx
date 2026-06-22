"use client";

import { useCallback, useState } from "react";
import { ChartAppearanceSection } from "../components/chart/editor/chart-appearance-section";
import { ChartAxisScaleSection } from "../components/chart/editor/chart-axis-scale-section";
import { ChartBasicSettings } from "../components/chart/editor/chart-basic-settings";
import { ChartEditorGuide } from "../components/chart/editor/chart-editor-guide";
import { ChartPreviewPanel } from "../components/chart/editor/chart-preview-panel";
import { ChartSeriesSection } from "../components/chart/editor/chart-series-section";
import { EditorPageHeader } from "../components/editor/editor-page-header";
import { OnboardingTour } from "../components/onboarding/onboarding-tour";
import { ShareProjectDialog } from "../components/share/share-project-dialog";
import { useChartEditor } from "../hooks/use-chart-editor";
import { useOnboardingTour } from "../hooks/use-onboarding-tour";
import { chartEditorTourSteps } from "../utils/constants/onboarding-tours";

interface ChartEditorPageProps {
    onBack: () => void;
    projectId?: string;
}

export const ChartEditorPage = ({ onBack, projectId }: ChartEditorPageProps) => {
    const editor = useChartEditor(projectId);
    const onboarding = useOnboardingTour("chart-editor", chartEditorTourSteps);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

    const ensureProjectSaved = useCallback(async () => {
        const savedProject = await editor.saveProject();

        return savedProject?.id;
    }, [editor]);
    
    const handleClearChart = () => {
        const confirmed = window.confirm(
            "Restaurar o gráfico para o exemplo inicial? O rascunho atual será substituído.",
        );

        if (confirmed) {
            editor.clearChart();
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 sm:py-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <div data-tour="chart-editor-header">
                    <EditorPageHeader
                        title="Criação de gráfico"
                        description="Monte o gráfico por etapas e mantenha o rascunho salvo automaticamente."
                        onBack={onBack}
                        onSave={editor.saveProject}
                        onShare={() => setIsShareDialogOpen(true)}
                        onClear={handleClearChart}
                        onStartTour={onboarding.startTour}
                        lastSavedAt={editor.lastSavedAt}
                        lastDraftSavedAt={editor.lastDraftSavedAt}
                        clearLabel="Limpar gráfico"
                    />
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]">
                    <section className="min-w-0 space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
                        <ChartEditorGuide />

                        <ChartBasicSettings
                            chart={editor.chart}
                            updateChart={editor.updateChart}
                            updateAxis={editor.updateAxis}
                        />

                        <ChartAxisScaleSection
                            chart={editor.chart}
                            updateAxis={editor.updateAxis}
                        />

                        <ChartAppearanceSection
                            chart={editor.chart}
                            updateChart={editor.updateChart}
                            updateAppearance={editor.updateAppearance}
                        />

                        <ChartSeriesSection
                            chart={editor.chart}
                            updateSeries={editor.updateSeries}
                            addSeries={editor.addSeries}
                            removeSeries={editor.removeSeries}
                            addPoint={editor.addPoint}
                            removePoint={editor.removePoint}
                            updatePoint={editor.updatePoint}
                            addGaussianPeakSeries={editor.addGaussianPeakSeries}
                            updateGaussianPeak={editor.updateGaussianPeak}
                        />
                    </section>

                    <ChartPreviewPanel chart={editor.chart} />
                </div>
            </div>

            <OnboardingTour
                currentStepIndex={onboarding.currentStepIndex}
                isOpen={onboarding.isOpen}
                onNext={onboarding.nextStep}
                onPrevious={onboarding.previousStep}
                onSkip={onboarding.skipTour}
                steps={chartEditorTourSteps}
            />

            <ShareProjectDialog
                isOpen={isShareDialogOpen}
                onEnsureSaved={ensureProjectSaved}
                onOpenChange={setIsShareDialogOpen}
                projectId={editor.currentProjectId}
            />
        </main>
    );
};
