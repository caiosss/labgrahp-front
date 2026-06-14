import { linearRegression, linearRegressionLine, rSquared } from "simple-statistics";

export interface RegressionPoint {
    x: number;
    y: number;
}

export interface LinearRegressionResult {
    intercept: number;
    rSquared: number;
    slope: number;
    x: [number, number];
    y: [number, number];
}

const roundDisplayNumber = (value: number) => {
    if (Object.is(value, -0)) {
        return "0";
    }

    const absoluteValue = Math.abs(value);

    if (absoluteValue !== 0 && (absoluteValue < 0.001 || absoluteValue >= 1000)) {
        return value.toExponential(3);
    }

    return Number(value.toFixed(4)).toString();
};

export const calculateLinearRegression = (
    points: RegressionPoint[],
): LinearRegressionResult | null => {
    const validPoints = points.filter(
        (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
    );
    const uniqueXValues = new Set(validPoints.map((point) => point.x));

    if (validPoints.length < 2 || uniqueXValues.size < 2) {
        return null;
    }

    const regressionInput = validPoints.map(
        (point) => [point.x, point.y] as [number, number],
    );
    const regression = linearRegression(regressionInput);
    const regressionLine = linearRegressionLine(regression);
    const xValues = validPoints.map((point) => point.x);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);

    return {
        intercept: regression.b,
        rSquared: rSquared(regressionInput, regressionLine),
        slope: regression.m,
        x: [minX, maxX],
        y: [regressionLine(minX), regressionLine(maxX)],
    };
};

export const formatLinearRegressionEquation = ({
    intercept,
    rSquared: coefficientOfDetermination,
    slope,
}: LinearRegressionResult) => {
    const interceptSign = intercept >= 0 ? "+" : "-";

    return `y = ${roundDisplayNumber(slope)}x ${interceptSign} ${roundDisplayNumber(Math.abs(intercept))} | R² = ${roundDisplayNumber(coefficientOfDetermination)}`;
};
