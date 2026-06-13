import type { ChartConfig } from "../../types/chart";
import { createRandomUUID } from "../create-random-uuid";

export const initialChart: ChartConfig = {
    title: "Gráfico 1: Absorbância em função do tempo",
    xAxis: {
        label: "Tempo",
        unit: "min",
        min: "0",
        max: "30",
        tickStep: "10",
        tickMode: "step",
        tickValues: "",
    },
    yAxis: {
        label: "Absorbância",
        unit: "",
        min: "0",
        max: "1",
        tickStep: "0.2",
        tickMode: "step",
        tickValues: "",
    },
    mode: "lines+markers",
    showGrid: true,
    showLegend: true,
    appearance: {
        width: "900",
        height: "560",
        titleFontSize: "18",
        fontFamily: "Arial",
        plotBackgroundColor: "#ffffff",
        paperBackgroundColor: "#ffffff",
    },
    series: [
        {
            id: createRandomUUID(),
            type: "manual",
            name: "Amostra 1",
            color: "#2563eb",
            markerSize: "8",
            markerSymbol: "circle",
            lineWidth: "2",
            lineDash: "solid",
            lineShape: "linear",
            points: [
                { id: createRandomUUID(), x: "0", y: "0.82" },
                { id: createRandomUUID(), x: "10", y: "0.69" },
                { id: createRandomUUID(), x: "20", y: "0.58" },
                { id: createRandomUUID(), x: "30", y: "0.47" },
            ],
        }
    ],
};
