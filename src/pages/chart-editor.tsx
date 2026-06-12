"use client";

import { ChartAppearanceSection } from "../components/chart/editor/chart-appearance-section";
import { ChartAxisScaleSection } from "../components/chart/editor/chart-axis-scale-section";
import { ChartBasicSettings } from "../components/chart/editor/chart-basic-settings";
import { ChartPreviewPanel } from "../components/chart/editor/chart-preview-panel";
import { ChartSeriesSection } from "../components/chart/editor/chart-series-section";
import { EditorPageHeader } from "../components/editor/editor-page-header";
import { useChartEditor } from "../hooks/use-chart-editor";

interface ChartEditorPageProps {
    onBack: () => void;
    projectId?: string;
}

export const ChartEditorPage = ({ onBack, projectId }: ChartEditorPageProps) => {
    const editor = useChartEditor(projectId);

    return (
        <main className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 sm:py-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <EditorPageHeader
                    title="Editor de grafico"
                    description="Edite os dados a esquerda e visualize o grafico antes do download."
                    onBack={onBack}
                    onSave={editor.saveProject}
                    lastSavedAt={editor.lastSavedAt}
                />

                <div className="grid min-w-0 grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]">
                    <section className="min-w-0 space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
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
        </main>
    );
};
