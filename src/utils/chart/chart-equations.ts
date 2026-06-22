import type { ChartConfig } from "../../types/chart";
import {
    calculateExponentialRegression,
    calculateLinearRegression,
    formatExponentialRegressionEquation,
    formatLinearRegressionEquation,
} from "../regression";
import { getValidPoints, shouldBreakLineAtPoint } from "./chart-data";

export interface ChartEquationSummary {
    equation?: string;
    message?: string;
    pointsUsed: number;
    seriesId: string;
    seriesName: string;
}

export const generateChartEquationSummaries = (
    chart: ChartConfig,
): ChartEquationSummary[] => {
    return chart.series.flatMap((serie) => {
        const regressionPoints = getValidPoints(serie.points).filter(
            (point) => !shouldBreakLineAtPoint(point),
        );
        const exponentialModel = serie.exponentialFit?.model ?? "simple";
        const positiveRegressionPoints = regressionPoints.filter(
            (point) => point.y > 0,
        );
        const regression = calculateLinearRegression(regressionPoints);
        const exponentialRegression =
            calculateExponentialRegression(regressionPoints, {
                model: exponentialModel,
            });
        const seriesName = serie.name || "Série sem nome";
        const summaries: ChartEquationSummary[] = [];

        if (regression) {
            summaries.push({
                equation: formatLinearRegressionEquation(regression, {
                    includeRSquared: serie.linearFit?.showRSquared ?? true,
                }),
                pointsUsed: regressionPoints.length,
                seriesId: `${serie.id}-linear`,
                seriesName: `${seriesName} - linear`,
            });
        } else {
            summaries.push({
                message:
                    "Não há pontos suficientes para calcular uma regressão linear.",
                pointsUsed: regressionPoints.length,
                seriesId: `${serie.id}-linear`,
                seriesName: `${seriesName} - linear`,
            });
        }

        if (exponentialRegression) {
            summaries.push({
                equation: formatExponentialRegressionEquation(exponentialRegression, {
                    includeRSquared: serie.exponentialFit?.showRSquared ?? true,
                }),
                pointsUsed:
                    exponentialModel === "vertical-offset"
                        ? regressionPoints.length
                        : positiveRegressionPoints.length,
                seriesId: `${serie.id}-exponential`,
                seriesName: `${seriesName} - exponencial`,
            });
        } else {
            summaries.push({
                message:
                    exponentialModel === "vertical-offset"
                        ? "Não há pontos suficientes para calcular uma regressão exponencial com deslocamento vertical."
                        : "Não há pontos positivos suficientes para calcular uma regressão exponencial.",
                pointsUsed:
                    exponentialModel === "vertical-offset"
                        ? regressionPoints.length
                        : positiveRegressionPoints.length,
                seriesId: `${serie.id}-exponential`,
                seriesName: `${seriesName} - exponencial`,
            });
        }

        return summaries;
    });
};
