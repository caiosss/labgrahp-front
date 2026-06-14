import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";
import type { Data } from "plotly.js";
import type { ChartConfig } from "../../types/chart";
import {
    calculateLinearRegression,
    formatLinearRegressionEquation,
} from "../../utils/regression";

const resolveDefaultExport = <T,>(module: T | { default: T }): T =>
    "default" in Object(module) ? (module as { default: T }).default : (module as T);

const Plot = resolveDefaultExport(createPlotlyComponent)(
    resolveDefaultExport(Plotly),
);

interface ChartPreviewProps {
    chart: ChartConfig;
}

export const ChartPreview = ({ chart }: ChartPreviewProps) => {
    const xTitle = chart.xAxis.unit
        ? `${chart.xAxis.label} (${chart.xAxis.unit})`
        : chart.xAxis.label;

    const yTitle = chart.yAxis.unit
        ? `${chart.yAxis.label} (${chart.yAxis.unit})`
        : chart.yAxis.label;

    const parseTickValues = (tickValues: string) => {
        return tickValues
            .split(",")
            .map((item) => Number(item.trim()))
            .filter((item) => !Number.isNaN(item));
    }

    const xTickValues =
        chart.xAxis.tickMode === "custom"
            ? parseTickValues(chart.xAxis.tickValues)
            : undefined;

    const yTickValues =
        chart.yAxis.tickMode === "custom"
            ? parseTickValues(chart.yAxis.tickValues)
            : undefined;
    const toNumberOrNull = (value: string) => {
        if (value.trim() === "") {
            return null;
        }

        const parsedValue = Number(value);

        return Number.isNaN(parsedValue) ? null : parsedValue;
    };
    const plotSeries: Data[] = chart.series
        .flatMap((serie): Data[] => {
            const validPoints = serie.points
                .map((point) => ({
                    x: toNumberOrNull(point.x),
                    y: toNumberOrNull(point.y),
                }))
                .filter((point): point is { x: number; y: number } =>
                    point.x !== null && point.y !== null,
                );

            if (validPoints.length === 0) {
                return [];
            }

            const originalTrace: Data = {
                x: validPoints.map((point) => point.x),
                y: validPoints.map((point) => point.y),
                type: "scatter" as const,
                mode: chart.mode,
                name: serie.name || "Serie sem nome",
                legendgroup: serie.id,
                cliponaxis: false,
                marker: {
                    color: serie.color,
                    size: Number(serie.markerSize) || 8,
                    symbol: serie.markerSymbol,
                },
                line: {
                    color: serie.color,
                    width: Number(serie.lineWidth) || 2,
                    dash: serie.lineDash,
                    shape: serie.lineShape,
                },
            };

            if (!serie.linearFit?.enabled) {
                return [originalTrace];
            }

            const regression = calculateLinearRegression(validPoints);

            if (!regression) {
                return [originalTrace];
            }

            const equation = formatLinearRegressionEquation(regression);
            const linearFitTrace: Data = {
                x: regression.x,
                y: regression.y,
                type: "scatter" as const,
                mode: "lines" as const,
                name: `Ajuste linear - ${serie.name || "Serie sem nome"}`,
                legendgroup: serie.id,
                hovertemplate: serie.linearFit.showEquation
                    ? `${equation}<extra></extra>`
                    : undefined,
                line: {
                    color: serie.linearFit.color || serie.color,
                    width: Number(serie.linearFit.lineWidth) || 2,
                    dash: serie.linearFit.lineDash,
                    shape: "linear",
                },
            };

            return [originalTrace, linearFitTrace];
        });

    if (plotSeries.length === 0) {
        return (
            <div
                className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center"
                style={{
                    height: `${Number(chart.appearance.height) || 560}px`,
                    maxHeight: "70vh",
                }}
            >
                <div>
                    <p className="font-medium text-slate-700">
                        Nenhum ponto valido para visualizar
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        Preencha pelo menos um par X/Y na serie manual ou gere uma curva de pico.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Plot
            data={plotSeries}
            layout={{
                autosize: true,
                title: {
                    text: chart.title || "Título do gráfico",
                    font: {
                        size: Number(chart.appearance.titleFontSize) || 16,
                        family: chart.appearance.fontFamily,
                    },
                },
                font: {
                    family: chart.appearance.fontFamily,
                },
                plot_bgcolor: chart.appearance.plotBackgroundColor,
                paper_bgcolor: chart.appearance.paperBackgroundColor,
                xaxis: {
                    title: {
                        text: xTitle || "Eixo X",
                    },
                    showgrid: chart.showGrid,
                    zeroline: false,
                    range:
                        chart.xAxis.min !== "" && chart.xAxis.max !== ""
                            ? [Number(chart.xAxis.min), Number(chart.xAxis.max)]
                            : undefined,
                    tickmode: chart.xAxis.tickMode === "custom" ? "array" : "linear",
                    tickvals: xTickValues,
                    dtick:
                        chart.xAxis.tickMode === "step" && chart.xAxis.tickStep !== ""
                            ? Number(chart.xAxis.tickStep)
                            : undefined,
                },
                yaxis: {
                    title: {
                        text: yTitle || "Eixo Y",
                    },
                    showgrid: chart.showGrid,
                    zeroline: false,
                    range:
                        chart.yAxis.min !== "" && chart.yAxis.max !== ""
                            ? [Number(chart.yAxis.min), Number(chart.yAxis.max)]
                            : undefined,
                    tickmode: chart.yAxis.tickMode === "custom" ? "array" : "linear",
                    tickvals: yTickValues,
                    dtick:
                        chart.yAxis.tickMode === "step" && chart.yAxis.tickStep !== ""
                            ? Number(chart.yAxis.tickStep)
                            : undefined,
                },
                showlegend: chart.showLegend,
                margin: {
                    l: 64,
                    r: 24,
                    t: 72,
                    b: 64,
                },
            }}
            config={{
                responsive: true,
                displaylogo: false,
                toImageButtonOptions: {
                    format: "png",
                    filename: "grafico",
                    width: Number(chart.appearance.width) || 900,
                    height: Number(chart.appearance.height) || 560,
                    scale: 2,
                },
            }}
            useResizeHandler
            style={{
                width: "100%",
                height: `${Number(chart.appearance.height) || 560}px`,
                maxHeight: "70vh",
                minHeight: "360px",
            }}
        />
    );

}
