import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";
import type { ChartConfig } from "../../types/chart";

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

    return (
        <Plot
            data={chart.series.map((serie) => ({
                x: serie.points.map((point) => Number(point.x)),
                y: serie.points.map((point) => Number(point.y)),
                type: "scatter",
                mode: chart.mode,
                name: serie.name,
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
            }))}
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
