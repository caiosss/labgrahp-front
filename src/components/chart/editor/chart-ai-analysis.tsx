import { AlertTriangle, BrainCircuit, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../hooks/use-auth";
import { analyzeChartWithAi } from "../../../services/ai-analysis-api";
import type { AiChartAnalysis } from "../../../types/ai-analysis";
import type { ChartConfig } from "../../../types/chart";
import { Button } from "../../ui/button";

interface ChartAiAnalysisProps {
    chart: ChartConfig;
}

const severityClasses = {
    positive: "border-emerald-200 bg-emerald-50 text-emerald-900",
    neutral: "border-blue-200 bg-blue-50 text-blue-950",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
};

const formatNumber = (value: number | null) =>
    value === null
        ? "não calculável"
        : new Intl.NumberFormat("pt-BR", {
            maximumFractionDigits: 4,
        }).format(value);

export const ChartAiAnalysis = ({ chart }: ChartAiAnalysisProps) => {
    const { isAuthenticated } = useAuth();
    const [analysis, setAnalysis] = useState<AiChartAnalysis>();
    const [error, setError] = useState<string>();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        if (isAnalyzing) return;

        setIsAnalyzing(true);
        setError(undefined);

        try {
            setAnalysis(await analyzeChartWithAi(chart));
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Não foi possível analisar o gráfico.",
            );
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-violet-950">
                        <BrainCircuit size={19} />
                        <h3 className="font-semibold">Análise inteligente</h3>
                    </div>
                    <p className="mt-1 text-sm text-violet-800">
                        Obtenha insights sobre o seu gráfico! Pode levar alguns minutos para gerar os resultados. 
                    </p>
                </div>

                <Button
                    disabled={!isAuthenticated || isAnalyzing}
                    onClick={() => void handleAnalyze()}
                    type="button"
                >
                    {isAnalyzing ? (
                        <Loader2 className="animate-spin" size={16} />
                    ) : (
                        <Sparkles size={16} />
                    )}
                    {isAnalyzing ? "Analisando..." : "Analisar"}
                </Button>
            </div>

            {!isAuthenticated && (
                <p className="mt-3 text-xs text-violet-800">
                    Entre na sua conta para utilizar a análise com IA.
                </p>
            )}

            {error && (
                <p className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                    <AlertTriangle className="mt-0.5 shrink-0" size={16} />
                    {error}
                </p>
            )}

            {analysis && (
                <div className="mt-4 space-y-4">
                    <div className="rounded-lg bg-white p-4">
                        <h4 className="text-sm font-semibold text-slate-900">Resumo</h4>
                        <p className="mt-1 text-sm leading-6 text-slate-700">{analysis.summary}</p>
                    </div>

                    {analysis.findings.length > 0 && (
                        <div className="grid gap-2 sm:grid-cols-2">
                            {analysis.findings.map((finding, index) => (
                                <article
                                    className={`rounded-lg border p-3 ${severityClasses[finding.severity]}`}
                                    key={`${finding.title}-${index}`}
                                >
                                    <h4 className="text-sm font-semibold">{finding.title}</h4>
                                    <p className="mt-1 text-xs leading-5">{finding.description}</p>
                                </article>
                            ))}
                        </div>
                    )}

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-slate-900">
                            Estatísticas calculadas
                        </h4>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {analysis.statistics.map((statistics, index) => (
                                <article
                                    className="rounded-lg border border-slate-200 bg-white p-3"
                                    key={`${statistics.name}-${index}`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h5 className="text-sm font-semibold text-slate-900">
                                            {statistics.name}
                                        </h5>
                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                                            {statistics.pointCount} pontos
                                        </span>
                                    </div>

                                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                                        <div>
                                            <dt className="text-slate-500">Tendência</dt>
                                            <dd className="font-medium text-slate-800">{statistics.trend}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-500">Qualidade dos dados</dt>
                                            <dd className="font-medium text-slate-800">{statistics.dataQuality}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-500">Correlação</dt>
                                            <dd className="font-medium text-slate-800">
                                                {formatNumber(statistics.correlation)} ({statistics.correlationStrength})
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-500">R² linear</dt>
                                            <dd className="font-medium text-slate-800">
                                                {formatNumber(statistics.linearRegression?.rSquared ?? null)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-500">Intervalo de X</dt>
                                            <dd className="font-medium text-slate-800">
                                                {formatNumber(statistics.xMin)} a {formatNumber(statistics.xMax)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-500">Intervalo de Y</dt>
                                            <dd className="font-medium text-slate-800">
                                                {formatNumber(statistics.yMin)} a {formatNumber(statistics.yMax)}
                                            </dd>
                                        </div>
                                    </dl>

                                    {statistics.linearRegression && (
                                        <p className="mt-3 rounded-md bg-slate-50 p-2 font-mono text-xs text-slate-700">
                                            y = {formatNumber(statistics.linearRegression.slope)}x + {formatNumber(statistics.linearRegression.intercept)}
                                        </p>
                                    )}

                                    <p className="mt-2 text-xs text-slate-500">
                                        Possíveis outliers: {statistics.possibleOutliers.length}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {analysis.caveats.length > 0 && (
                            <div className="rounded-lg border border-amber-200 bg-white p-3">
                                <h4 className="text-sm font-semibold text-slate-900">Cuidados</h4>
                                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-slate-600">
                                    {analysis.caveats.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                                </ul>
                            </div>
                        )}

                        {analysis.suggestions.length > 0 && (
                            <div className="rounded-lg border border-blue-200 bg-white p-3">
                                <h4 className="text-sm font-semibold text-slate-900">Sugestões</h4>
                                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-slate-600">
                                    {analysis.suggestions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-violet-700">
                        {analysis.disclaimer}
                    </p>
                </div>
            )}
        </div>
    );
};
