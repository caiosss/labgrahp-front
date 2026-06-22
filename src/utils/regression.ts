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

export interface ExponentialRegressionResult {
    a: number;
    b: number;
    rSquared: number;
    x: number[];
    y: number[];
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

export const calculateExponentialRegression = (
    points: RegressionPoint[],
): ExponentialRegressionResult | null => {
    const validPoints = points.filter(
        (point) =>
            Number.isFinite(point.x) &&
            Number.isFinite(point.y) &&
            point.y > 0,
    );
    const uniqueXValues = new Set(validPoints.map((point) => point.x));

    if (validPoints.length < 2 || uniqueXValues.size < 2) {
        return null;
    }

    const transformedInput = validPoints.map(
        (point) => [point.x, Math.log(point.y)] as [number, number],
    );
    const regression = linearRegression(transformedInput);
    const a = Math.exp(regression.b);
    const b = regression.m;
    const xValues = validPoints.map((point) => point.x);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const stepCount = 80;
    const step = (maxX - minX) / (stepCount - 1);
    const x = Array.from({ length: stepCount }, (_, index) => minX + step * index);
    const y = x.map((xValue) => a * Math.exp(b * xValue));
    const meanY =
        validPoints.reduce((sum, point) => sum + point.y, 0) / validPoints.length;
    const residualSumOfSquares = validPoints.reduce((sum, point) => {
        const predictedY = a * Math.exp(b * point.x);

        return sum + (point.y - predictedY) ** 2;
    }, 0);
    const totalSumOfSquares = validPoints.reduce(
        (sum, point) => sum + (point.y - meanY) ** 2,
        0,
    );
    const coefficientOfDetermination =
        totalSumOfSquares === 0 ? 1 : 1 - residualSumOfSquares / totalSumOfSquares;

    return {
        a,
        b,
        rSquared: coefficientOfDetermination,
        x,
        y,
    };
};

export const formatLinearRegressionEquation = ({
    intercept,
    rSquared: coefficientOfDetermination,
    slope,
}: LinearRegressionResult, options?: { includeRSquared?: boolean }) => {
    const interceptSign = intercept >= 0 ? "+" : "-";
    const equation = `y = ${roundDisplayNumber(slope)}x ${interceptSign} ${roundDisplayNumber(Math.abs(intercept))}`;

    if (options?.includeRSquared === false) {
        return equation;
    }

    return `${equation} | R² = ${roundDisplayNumber(coefficientOfDetermination)}`;
};

export const formatExponentialRegressionEquation = ({
    a,
    b,
    rSquared: coefficientOfDetermination,
}: ExponentialRegressionResult, options?: { includeRSquared?: boolean }) => {
    const equation = `y = ${roundDisplayNumber(a)}e^(${roundDisplayNumber(b)}x)`;

    if (options?.includeRSquared === false) {
        return equation;
    }

    return `${equation} | R² = ${roundDisplayNumber(coefficientOfDetermination)}`;
};
