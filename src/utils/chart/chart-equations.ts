import type { ChartConfig } from "../../types/chart";
import { calculateLinearRegression, formatLinearRegressionEquation } from "../regression";
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
    return chart.series.map((serie) => {
        const regressionPoints = getValidPoints(serie.points).filter(
            (point) => !shouldBreakLineAtPoint(point),
        );
        const regression = calculateLinearRegression(regressionPoints);
        const seriesName = serie.name || "Série sem nome";

        if (!regression) {
            return {
                message:
                    "Não há pontos suficientes para calcular uma regressão linear.",
                pointsUsed: regressionPoints.length,
                seriesId: serie.id,
                seriesName,
            };
        }

        return {
            equation: formatLinearRegressionEquation(regression, {
                includeRSquared: serie.linearFit?.showRSquared ?? true,
            }),
            pointsUsed: regressionPoints.length,
            seriesId: serie.id,
            seriesName,
        };
    });
};
