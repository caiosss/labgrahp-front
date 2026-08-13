export interface AiLinearRegression {
    slope: number;
    intercept: number;
    rSquared: number | null;
}

export interface AiSeriesStatistics {
    name: string;
    pointCount: number;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    xMean: number;
    yMean: number;
    correlation: number | null;
    linearRegression: AiLinearRegression | null;
    possibleOutliers: Array<{ x: number; y: number }>;
}

export interface AiFinding {
    title: string;
    description: string;
    severity: "positive" | "neutral" | "warning";
}

export interface AiChartAnalysis {
    summary: string;
    findings: AiFinding[];
    caveats: string[];
    suggestions: string[];
    statistics: AiSeriesStatistics[];
    model: string;
    disclaimer: string;
}
