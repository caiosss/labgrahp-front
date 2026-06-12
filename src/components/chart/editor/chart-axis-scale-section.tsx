import type { ChartAxisConfig, ChartConfig } from "../../../types/chart";

interface ChartAxisScaleSectionProps {
    chart: ChartConfig;
    updateAxis: (
        axis: "xAxis" | "yAxis",
        key: keyof ChartAxisConfig,
        value: string,
    ) => void;
}

interface AxisScaleFieldsProps {
    title: string;
    axis: "xAxis" | "yAxis";
    config: ChartAxisConfig;
    customPlaceholder: string;
    updateAxis: ChartAxisScaleSectionProps["updateAxis"];
}

const AxisScaleFields = ({
    title,
    axis,
    config,
    customPlaceholder,
    updateAxis,
}: AxisScaleFieldsProps) => {
    return (
        <div>
            <h3 className="mb-2 text-sm font-medium text-slate-700">{title}</h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                    <label className="text-sm text-slate-600">Minimo</label>
                    <input
                        type="number"
                        value={config.min}
                        onChange={(event) =>
                            updateAxis(axis, "min", event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-slate-600">Maximo</label>
                    <input
                        type="number"
                        value={config.max}
                        onChange={(event) =>
                            updateAxis(axis, "max", event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-slate-600">Intervalo</label>
                    <input
                        type="number"
                        value={config.tickStep}
                        onChange={(event) =>
                            updateAxis(axis, "tickStep", event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="mt-3 space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    Tipo de intervalo
                </label>

                <select
                    value={config.tickMode}
                    onChange={(event) =>
                        updateAxis(axis, "tickMode", event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                    <option value="step">Intervalo fixo</option>
                    <option value="custom">Valores personalizados</option>
                </select>
            </div>

            {config.tickMode === "custom" && (
                <div className="mt-3 space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        Valores personalizados
                    </label>

                    <input
                        value={config.tickValues}
                        onChange={(event) =>
                            updateAxis(axis, "tickValues", event.target.value)
                        }
                        placeholder={customPlaceholder}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                </div>
            )}
        </div>
    );
};

export const ChartAxisScaleSection = ({
    chart,
    updateAxis,
}: ChartAxisScaleSectionProps) => {
    return (
        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-900">Escala dos eixos</h2>

            <AxisScaleFields
                title="Eixo X"
                axis="xAxis"
                config={chart.xAxis}
                customPlaceholder="Ex: 0, 2.5, 5, 7.5, 10"
                updateAxis={updateAxis}
            />

            <AxisScaleFields
                title="Eixo Y"
                axis="yAxis"
                config={chart.yAxis}
                customPlaceholder="Ex: 0, 3.15, 6.31, 9.46, 12.62"
                updateAxis={updateAxis}
            />
        </div>
    );
};
