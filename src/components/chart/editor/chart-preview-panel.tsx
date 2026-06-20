import { useMemo, useRef, useState } from "react";
import { Copy, FileText, FunctionSquare, Loader2 } from "lucide-react";
import type { ChartConfig } from "../../../types/chart";
import { generateChartEquationSummaries } from "../../../utils/chart/chart-equations";
import { exportPlotlyChartAsPDF } from "../../../utils/chart/export-chart-pdf";
import { ChartPreview } from "../chart-preview";

interface ChartPreviewPanelProps {
    chart: ChartConfig;
}

export const ChartPreviewPanel = ({ chart }: ChartPreviewPanelProps) => {
    const chartElementRef = useRef<HTMLElement | null>(null);
    const [showEquations, setShowEquations] = useState(false);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [copyStatus, setCopyStatus] = useState<string | undefined>();
    const equations = useMemo(() => generateChartEquationSummaries(chart), [chart]);
    const equationText = equations
        .map((item) =>
            item.equation
                ? `${item.seriesName}: ${item.equation}`
                : `${item.seriesName}: ${item.message}`,
        )
        .join("\n");

    const handleCopyEquations = async () => {
        if (!equationText) {
            return;
        }

        try {
            await navigator.clipboard.writeText(equationText);
            setCopyStatus("Copiado");
        } catch {
            setCopyStatus("Não foi possível copiar");
        }
    };

    const handleExportPDF = async () => {
        if (!chartElementRef.current || isExportingPDF) {
            return;
        }

        setIsExportingPDF(true);

        try {
            await exportPlotlyChartAsPDF(
                chartElementRef.current,
                chart.title || "grafico",
                Number(chart.appearance.width) || 900,
                Number(chart.appearance.height) || 560,
            );
        } finally {
            setIsExportingPDF(false);
        }
    };

    return (
        <section
            data-tour="chart-preview"
            className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5"
        >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="font-semibold text-slate-900">Preview</h2>
                    <p className="text-sm text-slate-500">
                        Revise o gráfico, gere equações e exporte o resultado.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                        onClick={() => setShowEquations((current) => !current)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        <FunctionSquare size={16} />
                        Equações
                    </button>

                    <button
                        onClick={handleExportPDF}
                        disabled={isExportingPDF}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isExportingPDF ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <FileText size={16} />
                        )}
                        PDF
                    </button>
                </div>
            </div>

            {showEquations && (
                <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-blue-950">
                                Equações geradas
                            </h3>
                            <p className="text-xs text-blue-800">
                                Cálculo por série usando os pontos válidos do gráfico.
                            </p>
                        </div>

                        <button
                            onClick={handleCopyEquations}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-800 hover:bg-blue-100"
                        >
                            <Copy size={14} />
                            Copiar
                        </button>
                    </div>

                    <div className="space-y-2">
                        {equations.map((item) => (
                            <div
                                key={item.seriesId}
                                className="rounded-lg bg-white p-3 text-sm text-slate-700"
                            >
                                <p className="font-medium text-slate-900">
                                    {item.seriesName}
                                </p>
                                <p className="mt-1 break-words font-mono text-xs">
                                    {item.equation ?? item.message}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Pontos usados: {item.pointsUsed}
                                </p>
                            </div>
                        ))}
                    </div>

                    {copyStatus && (
                        <p className="mt-2 text-xs text-blue-800">{copyStatus}</p>
                    )}
                </div>
            )}

            <div className="min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 sm:p-4">
                <ChartPreview
                    chart={chart}
                    onReady={(chartElement) => {
                        chartElementRef.current = chartElement;
                    }}
                />
            </div>
        </section>
    );
};
