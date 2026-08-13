import type { AiChartAnalysis } from "../types/ai-analysis";
import type { ChartConfig } from "../types/chart";
import { apiRequest } from "./api-client";

export const analyzeChartWithAi = (chart: ChartConfig) =>
    apiRequest<AiChartAnalysis>("/ai/analyze", {
        authentication: "identity",
        body: JSON.stringify({ chart }),
        method: "POST",
    });
