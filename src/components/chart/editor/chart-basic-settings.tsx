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
        <>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    Titulo do grafico
                </label>

                <textarea
                    value={chart.title}
                    onChange={(event) => updateChart("title", event.target.value)}
                    className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
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
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                </div>
            </div>
        </>
    );
};
