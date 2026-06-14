import { Plus, Trash2 } from "lucide-react";
import type {
    ChartConfig,
    ChartSeries,
    DataPoint,
    LinearFitConfig,
} from "../../../types/chart";
import { initialLinearFit } from "../../../utils/constants/initial-chart";

interface ChartSeriesSectionProps {
    chart: ChartConfig;
    updateSeries: (
        seriesId: string,
        key: keyof ChartSeries,
        value: ChartSeries[keyof ChartSeries],
    ) => void;
    addSeries: () => void;
    removeSeries: (seriesId: string) => void;
    addPoint: (seriesId: string) => void;
    removePoint: (seriesId: string, pointId: string) => void;
    updatePoint: (
        seriesId: string,
        pointId: string,
        key: keyof DataPoint,
        value: string,
    ) => void;
    addGaussianPeakSeries: () => void;
    updateGaussianPeak: (
        seriesId: string,
        key: keyof NonNullable<ChartSeries["gaussianPeak"]>,
        value: string,
    ) => void;
}

interface ChartSeriesCardProps extends Omit<ChartSeriesSectionProps, "chart" | "addSeries" | "addGaussianPeakSeries"> {
    serie: ChartSeries;
    seriesIndex: number;
    canRemoveSeries: boolean;
}

const SeriesStyleFields = ({
    serie,
    updateSeries,
}: Pick<ChartSeriesCardProps, "serie" | "updateSeries">) => {
    return (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    Tamanho dos pontos
                </label>

                <input
                    type="number"
                    value={serie.markerSize}
                    onChange={(event) =>
                        updateSeries(serie.id, "markerSize", event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    Formato da linha
                </label>

                <select
                    value={serie.lineShape}
                    onChange={(event) =>
                        updateSeries(serie.id, "lineShape", event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                    <option value="linear">Reta entre pontos</option>
                    <option value="spline">Curva suavizada</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    Espessura da linha
                </label>

                <input
                    type="number"
                    value={serie.lineWidth}
                    onChange={(event) =>
                        updateSeries(serie.id, "lineWidth", event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    Formato dos pontos
                </label>

                <select
                    value={serie.markerSymbol}
                    onChange={(event) =>
                        updateSeries(serie.id, "markerSymbol", event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                    <option value="circle">Circulo</option>
                    <option value="square">Quadrado</option>
                    <option value="diamond">Diamante</option>
                    <option value="cross">Cruz</option>
                    <option value="x">X</option>
                    <option value="triangle-up">Triangulo para cima</option>
                    <option value="triangle-down">Triangulo para baixo</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    Tipo da linha
                </label>

                <select
                    value={serie.lineDash}
                    onChange={(event) =>
                        updateSeries(serie.id, "lineDash", event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                    <option value="solid">Continua</option>
                    <option value="dash">Tracejada</option>
                    <option value="dot">Pontilhada</option>
                    <option value="dashdot">Traco-ponto</option>
                </select>
            </div>
        </div>
    );
};

const LinearFitFields = ({
    serie,
    updateSeries,
}: Pick<ChartSeriesCardProps, "serie" | "updateSeries">) => {
    const linearFit = serie.linearFit ?? initialLinearFit;
    const updateLinearFit = <K extends keyof LinearFitConfig>(
        key: K,
        value: LinearFitConfig[K],
    ) => {
        updateSeries(serie.id, "linearFit", {
            ...linearFit,
            [key]: value,
        });
    };

    return (
        <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-blue-950">
                        Ajuste linear
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-blue-800">
                        Gera uma reta y = mx + b usando apenas os pontos válidos desta série.
                    </p>
                </div>

                <label className="inline-flex items-center gap-2 text-sm font-medium text-blue-950">
                    <input
                        type="checkbox"
                        checked={linearFit.enabled}
                        onChange={(event) =>
                            updateLinearFit("enabled", event.target.checked)
                        }
                    />
                    Ativar
                </label>
            </div>

            {linearFit.enabled && (
                <div className="mt-3 space-y-3">
                    <p className="text-xs text-blue-700">
                        A reta aparece quando houver pelo menos dois pontos X/Y válidos com valores de X diferentes.
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                                Cor da reta
                            </label>

                            <input
                                type="color"
                                value={linearFit.color}
                                onChange={(event) =>
                                    updateLinearFit("color", event.target.value)
                                }
                                className="h-10 w-full rounded-lg border border-slate-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                                Espessura
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={linearFit.lineWidth}
                                onChange={(event) =>
                                    updateLinearFit("lineWidth", event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                                Tipo da reta
                            </label>

                            <select
                                value={linearFit.lineDash}
                                onChange={(event) =>
                                    updateLinearFit(
                                        "lineDash",
                                        event.target.value as LinearFitConfig["lineDash"],
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            >
                                <option value="solid">Contínua</option>
                                <option value="dash">Tracejada</option>
                                <option value="dot">Pontilhada</option>
                                <option value="dashdot">Traço-ponto</option>
                            </select>
                        </div>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={linearFit.showEquation}
                            onChange={(event) =>
                                updateLinearFit("showEquation", event.target.checked)
                            }
                        />
                        Mostrar equação no hover
                    </label>
                </div>
            )}
        </div>
    );
};

const GaussianPeakFields = ({
    serie,
    updateGaussianPeak,
}: Pick<ChartSeriesCardProps, "serie" | "updateGaussianPeak">) => {
    if (!serie.gaussianPeak) {
        return null;
    }

    const fields: Array<{
        key: keyof NonNullable<ChartSeries["gaussianPeak"]>;
        label: string;
    }> = [
            { key: "xMin", label: "X minimo" },
            { key: "xMax", label: "X maximo" },
            { key: "peakX", label: "Pico em X" },
            { key: "amplitude", label: "Altura" },
            { key: "width", label: "Largura" },
            { key: "baseline", label: "Linha de base" },
            { key: "step", label: "Passo" },
        ];

    return (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3">
            <h4 className="mb-3 text-sm font-semibold text-red-900">
                Parametros da curva de pico
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {fields.map((field) => (
                    <div key={field.key} className="space-y-1">
                        <label className="text-xs text-slate-600">{field.label}</label>
                        <input
                            type="number"
                            value={serie.gaussianPeak?.[field.key] ?? ""}
                            onChange={(event) =>
                                updateGaussianPeak(serie.id, field.key, event.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const ManualPointList = ({
    serie,
    addPoint,
    removePoint,
    updatePoint,
}: Pick<ChartSeriesCardProps, "serie" | "addPoint" | "removePoint" | "updatePoint">) => {
    if (serie.type !== "manual") {
        return null;
    }

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px] gap-2 text-xs font-medium text-slate-500">
                <span>X</span>
                <span>Y</span>
                <span></span>
            </div>

            {serie.points.map((point) => (
                <div
                    key={point.id}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px] gap-2"
                >
                    <input
                        type="number"
                        value={point.x}
                        onChange={(event) =>
                            updatePoint(serie.id, point.id, "x", event.target.value)
                        }
                        className="min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />

                    <input
                        type="number"
                        value={point.y}
                        onChange={(event) =>
                            updatePoint(serie.id, point.id, "y", event.target.value)
                        }
                        className="min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />

                    <button
                        onClick={() => removePoint(serie.id, point.id)}
                        disabled={serie.points.length <= 1}
                        className="rounded-lg border border-slate-300 px-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            ))}

            <button
                onClick={() => addPoint(serie.id)}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
                <Plus size={16} />
                Adicionar ponto
            </button>
        </div>
    );
};

const ChartSeriesCard = ({
    serie,
    seriesIndex,
    canRemoveSeries,
    updateSeries,
    removeSeries,
    addPoint,
    removePoint,
    updatePoint,
    updateGaussianPeak,
}: ChartSeriesCardProps) => {
    return (
        <div className="min-w-0 rounded-xl border border-slate-200 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium text-slate-800">
                    Serie {seriesIndex + 1}
                </h3>

                <button
                    onClick={() => removeSeries(serie.id)}
                    disabled={!canRemoveSeries}
                    className="text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="mb-3 grid grid-cols-[minmax(0,1fr)_64px] gap-3 sm:grid-cols-[minmax(0,1fr)_80px]">
                <input
                    value={serie.name}
                    onChange={(event) =>
                        updateSeries(serie.id, "name", event.target.value)
                    }
                    className="min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="Nome da serie"
                />

                <input
                    type="color"
                    value={serie.color}
                    onChange={(event) =>
                        updateSeries(serie.id, "color", event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-slate-300"
                />
            </div>

            <SeriesStyleFields serie={serie} updateSeries={updateSeries} />

            <LinearFitFields serie={serie} updateSeries={updateSeries} />

            <GaussianPeakFields
                serie={serie}
                updateGaussianPeak={updateGaussianPeak}
            />

            <ManualPointList
                serie={serie}
                addPoint={addPoint}
                removePoint={removePoint}
                updatePoint={updatePoint}
            />
        </div>
    );
};

export const ChartSeriesSection = ({
    chart,
    updateSeries,
    addSeries,
    removeSeries,
    addPoint,
    removePoint,
    updatePoint,
    addGaussianPeakSeries,
    updateGaussianPeak,
}: ChartSeriesSectionProps) => {
    return (
        <div data-tour="chart-series" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-semibold text-slate-900">Dados</h2>
                    <p className="text-sm text-slate-500">
                        Cada serie vira uma linha, conjunto de pontos ou curva no gráfico.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={addSeries}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        Serie manual
                    </button>

                    <button
                        onClick={addGaussianPeakSeries}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                    >
                        <Plus size={16} />
                        Curva de pico
                    </button>
                </div>
            </div>

            <div className="max-h-none space-y-4 overflow-visible pr-0 lg:max-h-[32.5rem] lg:overflow-auto lg:pr-2">
                {chart.series.map((serie, seriesIndex) => (
                    <ChartSeriesCard
                        key={serie.id}
                        serie={serie}
                        seriesIndex={seriesIndex}
                        canRemoveSeries={chart.series.length > 1}
                        updateSeries={updateSeries}
                        removeSeries={removeSeries}
                        addPoint={addPoint}
                        removePoint={removePoint}
                        updatePoint={updatePoint}
                        updateGaussianPeak={updateGaussianPeak}
                    />
                ))}
            </div>
        </div>
    );
};
