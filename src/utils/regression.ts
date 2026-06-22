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
    model: ExponentialRegressionModel;
    a: number;
    b: number;
    k: number;
    rSquared: number;
    x: number[];
    y: number[];
    y0?: number;
}

export type ExponentialRegressionModel = "simple" | "vertical-offset";

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

const buildExponentialCurve = (
    xValues: number[],
    predict: (x: number) => number,
) => {
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const stepCount = 80;
    const step = (maxX - minX) / (stepCount - 1);
    const x = Array.from({ length: stepCount }, (_, index) => minX + step * index);
    const y = x.map((xValue) => predict(xValue));

    return { x, y };
};

const calculateRSquared = (
    points: RegressionPoint[],
    predict: (x: number) => number,
) => {
    const meanY =
        points.reduce((sum, point) => sum + point.y, 0) / points.length;
    const residualSumOfSquares = points.reduce((sum, point) => {
        const predictedY = predict(point.x);

        return sum + (point.y - predictedY) ** 2;
    }, 0);
    const totalSumOfSquares = points.reduce(
        (sum, point) => sum + (point.y - meanY) ** 2,
        0,
    );

    return totalSumOfSquares === 0
        ? 1
        : 1 - residualSumOfSquares / totalSumOfSquares;
};

const calculateSimpleExponentialRegression = (
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
    const k = -b;
    const xValues = validPoints.map((point) => point.x);
    const predict = (xValue: number) => a * Math.exp(b * xValue);
    const curve = buildExponentialCurve(xValues, predict);

    return {
        a,
        b,
        k,
        model: "simple",
        rSquared: calculateRSquared(validPoints, predict),
        x: curve.x,
        y: curve.y,
    };
};

const calculateOffsetExponentialRegression = (
    points: RegressionPoint[],
): ExponentialRegressionResult | null => {
    const validPoints = points.filter(
        (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
    );
    const uniqueXValues = new Set(validPoints.map((point) => point.x));

    if (validPoints.length < 3 || uniqueXValues.size < 2) {
        return null;
    }

    const yValues = validPoints.map((point) => point.y);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const ySpan = maxY - minY;

    if (ySpan === 0) {
        return null;
    }

    const searchSpan = Math.max(Math.abs(ySpan), Math.abs(minY) * 0.2, 1);
    const lowerY0 = minY - searchSpan * 3;
    const upperY0 = minY - searchSpan * 0.000001;
    const candidateCount = 120;

    let bestResult: ExponentialRegressionResult | null = null;

    for (let index = 0; index < candidateCount; index += 1) {
        const ratio = index / (candidateCount - 1);
        const y0 = lowerY0 + (upperY0 - lowerY0) * ratio;
        const transformedInput = validPoints.map(
            (point) => [point.x, Math.log(point.y - y0)] as [number, number],
        );

        if (
            transformedInput.some(([, transformedY]) => !Number.isFinite(transformedY))
        ) {
            continue;
        }

        const regression = linearRegression(transformedInput);
        const a = Math.exp(regression.b);
        const b = regression.m;
        const k = -b;
        const predict = (xValue: number) => y0 + a * Math.exp(b * xValue);
        const coefficientOfDetermination = calculateRSquared(validPoints, predict);

        if (
            bestResult &&
            coefficientOfDetermination <= bestResult.rSquared
        ) {
            continue;
        }

        const curve = buildExponentialCurve(
            validPoints.map((point) => point.x),
            predict,
        );

        bestResult = {
            a,
            b,
            k,
            model: "vertical-offset",
            rSquared: coefficientOfDetermination,
            x: curve.x,
            y: curve.y,
            y0,
        };
    }

    return bestResult;
};

export const calculateExponentialRegression = (
    points: RegressionPoint[],
    options?: { model?: ExponentialRegressionModel },
): ExponentialRegressionResult | null => {
    if (options?.model === "vertical-offset") {
        return calculateOffsetExponentialRegression(points);
    }

    return calculateSimpleExponentialRegression(points);
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
    k,
    model,
    rSquared: coefficientOfDetermination,
    y0,
}: ExponentialRegressionResult, options?: { includeRSquared?: boolean }) => {
    const exponentSign = k >= 0 ? "-" : "+";
    const exponent = `${exponentSign}${roundDisplayNumber(Math.abs(k))}x`;
    const equation =
        model === "vertical-offset" && y0 !== undefined
            ? `y = ${roundDisplayNumber(y0)} + ${roundDisplayNumber(a)}e^(${exponent})`
            : `y = ${roundDisplayNumber(a)}e^(${exponent})`;

    if (options?.includeRSquared === false) {
        return equation;
    }

    return `${equation} | R² = ${roundDisplayNumber(coefficientOfDetermination)}`;
};
