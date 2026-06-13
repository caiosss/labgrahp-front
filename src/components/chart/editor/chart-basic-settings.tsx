import type { ChartAxisConfig, ChartConfig } from "../../../types/chart";

interface ChartBasicSettingsProps {
    chart: ChartConfig;
    updateChart: <K extends keyof ChartConfig>(key: K, value: ChartConfig[K]) => void;
    updateAxis: (
        axis: "xAxis" | "yAxis",
        key: keyof ChartAxisConfig,
        value: string,
    ) => void;
}

export const ChartBasicSettings = ({
    chart,
    updateChart,
    updateAxis,
}: ChartBasicSettingsProps) => {
    return (
        <section data-tour="chart-identification" className="space-y-4">
            <div className="space-y-3">
                <div>
                    <h2 className="font-semibold text-slate-900">Identificação</h2>
                    <p className="text-sm text-slate-500">
                        Esses textos aparecem no título e nos eixos do gráfico.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        Título do gráfico
                    </label>

                    <textarea
                        value={chart.title}
                        onChange={(event) => updateChart("title", event.target.value)}
                        placeholder="Ex: Absorbancia em funcao do tempo"
                        className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        Nome do eixo X
                    </label>

                    <input
                        value={chart.xAxis.label}
                        onChange={(event) =>
                            updateAxis("xAxis", "label", event.target.value)
                        }
                        placeholder="Ex: Tempo"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        Unidade X
                    </label>

                    <input
                        value={chart.xAxis.unit}
                        onChange={(event) =>
                            updateAxis("xAxis", "unit", event.target.value)
                        }
                        placeholder="Ex: min"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        Nome do eixo Y
                    </label>

                    <input
                        value={chart.yAxis.label}
                        onChange={(event) =>
                            updateAxis("yAxis", "label", event.target.value)
                        }
                        placeholder="Ex: Absorbancia"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        Unidade Y
                    </label>

                    <input
                        value={chart.yAxis.unit}
                        onChange={(event) =>
                            updateAxis("yAxis", "unit", event.target.value)
                        }
                        placeholder="Ex: AU"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                </div>
            </div>
        </section>
    );
};
