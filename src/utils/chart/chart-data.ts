import type { ChartAxisConfig, DataPoint } from "../../types/chart";

export interface NumericPoint {
    x: number;
    y: number;
}

export const toNumberOrNull = (value: string) => {
    if (value.trim() === "") {
        return null;
    }

    const parsedValue = Number(value);

    return Number.isNaN(parsedValue) ? null : parsedValue;
};

export const getValidPoints = (points: DataPoint[]) => {
    return points
        .map((point) => ({
            x: toNumberOrNull(point.x),
            y: toNumberOrNull(point.y),
        }))
        .filter((point): point is NumericPoint =>
            point.x !== null && point.y !== null,
        );
};

export const shouldBreakLineAtPoint = (point: NumericPoint) =>
    point.x === 0 || point.y === 0;

export const buildLinePoints = (points: NumericPoint[]) => {
    const x: Array<number | null> = [];
    const y: Array<number | null> = [];

    points.forEach((point) => {
        if (shouldBreakLineAtPoint(point)) {
            if (x.length > 0 && x[x.length - 1] !== null) {
                x.push(null);
                y.push(null);
            }

            return;
        }

        x.push(point.x);
        y.push(point.y);
    });

    return { x, y };
};

const parseAxisLimit = (value: string) => {
    if (value.trim() === "") {
        return null;
    }

    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const resolveAxisRange = (
    axis: ChartAxisConfig,
    values: number[],
): [number, number] | undefined => {
    const configuredMin = parseAxisLimit(axis.min);
    const configuredMax = parseAxisLimit(axis.max);

    if (
        configuredMin === null ||
        configuredMax === null ||
        configuredMin >= configuredMax
    ) {
        return undefined;
    }

    const axisSpan = configuredMax - configuredMin;
    const padding = axisSpan > 0 ? axisSpan * 0.04 : 1;
    const hasValueAtMin = values.some((value) => value <= configuredMin);
    const hasValueAtMax = values.some((value) => value >= configuredMax);

    return [
        hasValueAtMin ? configuredMin - padding : configuredMin,
        hasValueAtMax ? configuredMax + padding : configuredMax,
    ];
};
