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
                        A IA analisa o gráfico e fornece insights sobre os dados! 
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
                    {isAnalyzing ? "Analisando..." : "Analisar com IA"}
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
                        {analysis.disclaimer} Modelo: {analysis.model}.
                    </p>
                </div>
            )}
        </div>
    );
};
