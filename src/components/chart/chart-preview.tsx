import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";
import type { Data } from "plotly.js";
import type { ChartConfig } from "../../types/chart";
import {
    buildLinePoints,
    getValidPoints,
    resolveAxisRange,
    shouldBreakLineAtPoint,
} from "../../utils/chart/chart-data";
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
    onReady?: (chartElement: HTMLElement) => void;
}

export const ChartPreview = ({ chart, onReady }: ChartPreviewProps) => {
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
    };

    const xTickValues =
        chart.xAxis.tickMode === "custom"
            ? parseTickValues(chart.xAxis.tickValues)
            : undefined;

    const yTickValues =
        chart.yAxis.tickMode === "custom"
            ? parseTickValues(chart.yAxis.tickValues)
            : undefined;
    const titleFontSize = Number(chart.appearance.titleFontSize) || 18;
    const axisTitleFontSize = Number(chart.appearance.axisTitleFontSize) || 14;
    const tickFontSize = Number(chart.appearance.tickFontSize) || 12;
    const legendFontSize = Number(chart.appearance.legendFontSize) || 12;
    const allValidPoints = chart.series.flatMap((serie) =>
        getValidPoints(serie.points),
    );
    const xRange = resolveAxisRange(
        chart.xAxis,
        allValidPoints.map((point) => point.x),
    );
    const yRange = resolveAxisRange(
        chart.yAxis,
        allValidPoints.map((point) => point.y),
    );

    const plotSeries: Data[] = chart.series
        .flatMap((serie): Data[] => {
            const validPoints = getValidPoints(serie.points);
            const lineBreakPoints = validPoints.filter(shouldBreakLineAtPoint);
            const regressionPoints = validPoints.filter(
                (point) => !shouldBreakLineAtPoint(point),
            );
            const linePoints = buildLinePoints(validPoints);

            if (validPoints.length === 0) {
                return [];
            }

            const seriesName = serie.name || "Serie sem nome";
            const shouldShowMarkers = chart.mode.includes("markers");
            const regression = calculateLinearRegression(regressionPoints);
            const includeRSquared = serie.linearFit?.showRSquared ?? true;
            const equation = regression
                ? formatLinearRegressionEquation(regression, { includeRSquared })
                : undefined;
            const shouldShowEquation = (serie.linearFit?.showEquation ?? true) && equation;
            const seriesTraces: Data[] = [];
            const originalTrace: Data = {
                x:
                    chart.mode === "markers"
                        ? validPoints.map((point) => point.x)
                        : linePoints.x,
                y:
                    chart.mode === "markers"
                        ? validPoints.map((point) => point.y)
                        : linePoints.y,
                type: "scatter" as const,
                mode: chart.mode,
                name: shouldShowEquation ? `${seriesName}: ${equation}` : seriesName,
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

            seriesTraces.push(originalTrace);

            if (shouldShowMarkers && lineBreakPoints.length > 0) {
                seriesTraces.push({
                    x: lineBreakPoints.map((point) => point.x),
                    y: lineBreakPoints.map((point) => point.y),
                    type: "scatter" as const,
                    mode: "markers" as const,
                    name: seriesName,
                    legendgroup: serie.id,
                    showlegend: false,
                    cliponaxis: false,
                    marker: {
                        color: serie.color,
                        size: Number(serie.markerSize) || 8,
                        symbol: serie.markerSymbol,
                    },
                });
            }

            if (!serie.linearFit?.enabled) {
                return seriesTraces;
            }

            if (!regression) {
                return seriesTraces;
            }

            const linearFitName = `Ajuste linear - ${seriesName}`;
            const linearFitTrace: Data = {
                x: regression.x,
                y: regression.y,
                type: "scatter" as const,
                mode: "lines" as const,
                name: linearFitName,
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

            return [...seriesTraces, linearFitTrace];
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
                        size: titleFontSize,
                        family: chart.appearance.fontFamily,
                    },
                },
                font: {
                    family: chart.appearance.fontFamily,
                    size: tickFontSize,
                },
                plot_bgcolor: chart.appearance.plotBackgroundColor,
                paper_bgcolor: chart.appearance.paperBackgroundColor,
                xaxis: {
                    title: {
                        text: xTitle || "Eixo X",
                        font: {
                            size: axisTitleFontSize,
                        },
                    },
                    tickfont: {
                        size: tickFontSize,
                    },
                    showgrid: chart.showGrid,
                    zeroline: false,
                    range: xRange,
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
                        font: {
                            size: axisTitleFontSize,
                        },
                    },
                    tickfont: {
                        size: tickFontSize,
                    },
                    showgrid: chart.showGrid,
                    zeroline: false,
                    range: yRange,
                    tickmode: chart.yAxis.tickMode === "custom" ? "array" : "linear",
                    tickvals: yTickValues,
                    dtick:
                        chart.yAxis.tickMode === "step" && chart.yAxis.tickStep !== ""
                            ? Number(chart.yAxis.tickStep)
                            : undefined,
                },
                showlegend: chart.showLegend,
                legend: {
                    font: {
                        size: legendFontSize,
                    },
                },
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
            onInitialized={(_, graphElement) =>
                onReady?.(graphElement as unknown as HTMLElement)
            }
            onUpdate={(_, graphElement) =>
                onReady?.(graphElement as unknown as HTMLElement)
            }
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
