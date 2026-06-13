import type { ChartConfig } from "../../../types/chart";
import { ChartPreview } from "../chart-preview";

interface ChartPreviewPanelProps {
    chart: ChartConfig;
}

export const ChartPreviewPanel = ({ chart }: ChartPreviewPanelProps) => {
    return (
        <section
            data-tour="chart-preview"
            className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5"
        >
            <div className="mb-4">
                <h2 className="font-semibold text-slate-900">Preview</h2>
                <p className="text-sm text-slate-500">
                    Use o botao de camera do gráfico para baixar em PNG.
                </p>
            </div>

            <div className="min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 sm:p-4">
                <ChartPreview chart={chart} />
            </div>
        </section>
    );
};
