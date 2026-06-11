"use client";

import { useState } from "react";
import type { ChartConfig, ChartMode, ChartSeries, DataPoint } from "../types/chart";
import { initialChart } from "../utils/constants/initial-chart";
import { createRandomUUID } from "../utils/create-random-uuid";
import { ChartPreview } from "../components/chart/chart-preview";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { generateGaussianPeak } from "../utils/generate-gaussian-peak";

interface ChartEditorPageProps {
    onBack: () => void;
}

export const ChartEditorPage = ({ onBack }: ChartEditorPageProps) => {
    const [chart, setChart] = useState<ChartConfig>(initialChart);

    const updateChart = <K extends keyof ChartConfig>(
        key: K,
        value: ChartConfig[K]) => {

        setChart((current) => ({
            ...current,
            [key]: value,
        }));
    }

    const updateAxis = (
        axis: "xAxis" | "yAxis",
        key:
            | "label"
            | "unit"
            | "min"
            | "max"
            | "tickStep"
            | "tickMode"
            | "tickValues",
        value: string
    ) => {
        setChart((current) => ({
            ...current,
            [axis]: {
                ...current[axis],
                [key]: value,
            },
        }));
    }

    const updateSeries = (
        seriesId: string,
        key: keyof ChartSeries,
        value: string
    ) => {
        setChart((current) => ({
            ...current,
            series: current.series.map((serie) =>
                serie.id === seriesId
                    ? {
                        ...serie,
                        [key]: value,
                    }
                    : serie
            ),
        }));
    }

    const addSeries = () => {
        const newSeries: ChartSeries = {
            id: createRandomUUID(),
            name: `Amostra ${chart.series.length + 1}`,
            color: "#16a34a",
            markerSize: "8",
            markerSymbol: "circle",
            lineWidth: "2",
            lineDash: "solid",
            lineShape: "linear",
            points: [
                { id: createRandomUUID(), x: "0", y: "0" },
                { id: createRandomUUID(), x: "1", y: "1" },
            ],
            type: "manual",
        };

        setChart((current) => ({
            ...current,
            series: [...current.series, newSeries],
        }));
    }

    const removeSeries = (seriesId: string) => {
        setChart((current) => ({
            ...current,
            series: current.series.filter((serie) => serie.id !== seriesId),
        }));
    }

    const addPoint = (seriesId: string) => {
        const newPoint: DataPoint = {
            id: createRandomUUID(),
            x: "",
            y: "",
        };

        setChart((current) => ({
            ...current,
            series: current.series.map((serie) =>
                serie.id === seriesId
                    ? {
                        ...serie,
                        points: [...serie.points, newPoint],
                    }
                    : serie
            ),
        }));
    }

    const removePoint = (seriesId: string, pointId: string) => {
        setChart((current) => ({
            ...current,
            series: current.series.map((serie) =>
                serie.id === seriesId
                    ? {
                        ...serie,
                        points: serie.points.filter((point) => point.id !== pointId),
                    }
                    : serie
            ),
        }));
    }

    const updatePoint = (seriesId: string, pointId: string, key: keyof DataPoint, value: string) => {
        setChart((current) => ({
            ...current,
            series: current.series.map((serie) =>
                serie.id === seriesId
                    ? {
                        ...serie,
                        points: serie.points.map((point) =>
                            point.id === pointId
                                ? {
                                    ...point,
                                    [key]: value,
                                }
                                : point
                        ),
                    }
                    : serie
            ),
        }));
    }

    const updateAppearance = (key: keyof ChartConfig["appearance"], value: string) => {
        setChart((current) => ({
            ...current,
            appearance: {
                ...current.appearance,
                [key]: value,
            },
        }));
    }

    const addGaussianPeakSeries = () => {
        const gaussianPeak = {
            xMin: "320",
            xMax: "800",
            peakX: "660",
            amplitude: "1",
            width: "35",
            baseline: "0.03",
            step: "2",
        };

        const newSeries: ChartSeries = {
            id: createRandomUUID(),
            type: "gaussian-peak",
            name: "Curva de pico",
            color: "#dc2626",
            markerSize: "0",
            markerSymbol: "circle",
            lineWidth: "2",
            lineDash: "solid",
            lineShape: "spline",
            gaussianPeak,
            points: generateGaussianPeak(gaussianPeak),
        };

        setChart((current) => ({
            ...current,
            series: [...current.series, newSeries],
        }));
    }

    const updateGaussianPeak = (
        seriesId: string,
        key: keyof NonNullable<ChartSeries["gaussianPeak"]>,
        value: string
    ) => {
        setChart((current) => ({
            ...current,
            series: current.series.map((serie) => {
                if (serie.id !== seriesId || !serie.gaussianPeak) {
                    return serie;
                }

                const gaussianPeak = {
                    ...serie.gaussianPeak,
                    [key]: value,
                };

                return {
                    ...serie,
                    gaussianPeak,
                    points: generateGaussianPeak(gaussianPeak),
                };
            }),
        }));
    }

    return (
        <main className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 sm:py-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <header>
                    <button
                        onClick={onBack}
                        className="mb-3 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft size={16} />
                        Voltar
                    </button>

                    <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                        Editor de gráfico
                    </h1>

                    <p className="max-w-2xl text-sm text-slate-600">
                        Edite os dados à esquerda e visualize o gráfico antes do download.
                    </p>
                </header>

                <div className="grid min-w-0 grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]">
                    <section className="min-w-0 space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Título do gráfico
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

                        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                            <h2 className="font-semibold text-slate-900">Escala dos eixos</h2>

                            <div>
                                <h3 className="mb-2 text-sm font-medium text-slate-700">Eixo X</h3>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-600">Mínimo</label>
                                        <input
                                            type="number"
                                            value={chart.xAxis.min}
                                            onChange={(event) =>
                                                updateAxis("xAxis", "min", event.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-600">Máximo</label>
                                        <input
                                            type="number"
                                            value={chart.xAxis.max}
                                            onChange={(event) =>
                                                updateAxis("xAxis", "max", event.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-600">Intervalo</label>
                                        <input
                                            type="number"
                                            value={chart.xAxis.tickStep}
                                            onChange={(event) =>
                                                updateAxis("xAxis", "tickStep", event.target.value)
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
                                        value={chart.xAxis.tickMode}
                                        onChange={(event) =>
                                            updateAxis("xAxis", "tickMode", event.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    >
                                        <option value="step">Intervalo fixo</option>
                                        <option value="custom">Valores personalizados</option>
                                    </select>
                                </div>

                                {chart.xAxis.tickMode === "custom" && (
                                    <div className="mt-3 space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Valores do eixo X
                                        </label>

                                        <input
                                            value={chart.xAxis.tickValues}
                                            onChange={(event) =>
                                                updateAxis("xAxis", "tickValues", event.target.value)
                                            }
                                            placeholder="Ex: 0, 2.5, 5, 7.5, 10"
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="mb-2 text-sm font-medium text-slate-700">Eixo Y</h3>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-600">Mínimo</label>
                                        <input
                                            type="number"
                                            value={chart.yAxis.min}
                                            onChange={(event) =>
                                                updateAxis("yAxis", "min", event.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-600">Máximo</label>
                                        <input
                                            type="number"
                                            value={chart.yAxis.max}
                                            onChange={(event) =>
                                                updateAxis("yAxis", "max", event.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-600">Intervalo</label>
                                        <input
                                            type="number"
                                            value={chart.yAxis.tickStep}
                                            onChange={(event) =>
                                                updateAxis("yAxis", "tickStep", event.target.value)
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
                                        value={chart.yAxis.tickMode}
                                        onChange={(event) =>
                                            updateAxis("yAxis", "tickMode", event.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    >
                                        <option value="step">Intervalo fixo</option>
                                        <option value="custom">Valores personalizados</option>
                                    </select>
                                </div>

                                {chart.yAxis.tickMode === "custom" && (
                                    <div className="mt-3 space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Valores do eixo Y
                                        </label>

                                        <input
                                            value={chart.yAxis.tickValues}
                                            onChange={(event) =>
                                                updateAxis("yAxis", "tickValues", event.target.value)
                                            }
                                            placeholder="Ex: 0, 3.15, 6.31, 9.46, 12.62"
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                            <h2 className="font-semibold text-slate-900">Aparência</h2>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Tipo de gráfico
                                </label>

                                <select
                                    value={chart.mode}
                                    onChange={(event) =>
                                        updateChart("mode", event.target.value as ChartMode)
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="markers">Somente pontos</option>
                                    <option value="lines">Somente linha</option>
                                    <option value="lines+markers">Linha + pontos</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Largura
                                    </label>

                                    <input
                                        type="number"
                                        value={chart.appearance.width}
                                        onChange={(event) =>
                                            updateAppearance("width", event.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Altura
                                    </label>

                                    <input
                                        type="number"
                                        value={chart.appearance.height}
                                        onChange={(event) =>
                                            updateAppearance("height", event.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Fonte
                                    </label>

                                    <select
                                        value={chart.appearance.fontFamily}
                                        onChange={(event) =>
                                            updateAppearance("fontFamily", event.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    >
                                        <option value="Arial">Arial</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                        <option value="Calibri">Calibri</option>
                                        <option value="Georgia">Georgia</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Tamanho do título
                                    </label>

                                    <input
                                        type="number"
                                        value={chart.appearance.titleFontSize}
                                        onChange={(event) =>
                                            updateAppearance("titleFontSize", event.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Fundo do gráfico
                                    </label>

                                    <input
                                        type="color"
                                        value={chart.appearance.plotBackgroundColor}
                                        onChange={(event) =>
                                            updateAppearance("plotBackgroundColor", event.target.value)
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-300"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Fundo externo
                                    </label>

                                    <input
                                        type="color"
                                        value={chart.appearance.paperBackgroundColor}
                                        onChange={(event) =>
                                            updateAppearance("paperBackgroundColor", event.target.value)
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-300"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={chart.showGrid}
                                    onChange={(event) =>
                                        updateChart("showGrid", event.target.checked)
                                    }
                                />
                                Mostrar grade
                            </label>

                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={chart.showLegend}
                                    onChange={(event) =>
                                        updateChart("showLegend", event.target.checked)
                                    }
                                />
                                Mostrar legenda
                            </label>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h2 className="font-semibold text-slate-900">Séries</h2>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={addSeries}
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                                    >
                                        <Plus size={16} />
                                        Série manual
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
                                    <div
                                        key={serie.id}
                                        className="min-w-0 rounded-xl border border-slate-200 p-3 sm:p-4"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="font-medium text-slate-800">
                                                Série {seriesIndex + 1}
                                            </h3>

                                            <button
                                                onClick={() => removeSeries(serie.id)}
                                                disabled={chart.series.length <= 1}
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
                                                placeholder="Nome da série"
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

                                        <div className="mb-4 grid grid-cols-2 gap-3">
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
                                                    <option value="circle">Círculo</option>
                                                    <option value="square">Quadrado</option>
                                                    <option value="diamond">Diamante</option>
                                                    <option value="cross">Cruz</option>
                                                    <option value="x">X</option>
                                                    <option value="triangle-up">Triângulo para cima</option>
                                                    <option value="triangle-down">Triângulo para baixo</option>
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
                                                    <option value="solid">Contínua</option>
                                                    <option value="dash">Tracejada</option>
                                                    <option value="dot">Pontilhada</option>
                                                    <option value="dashdot">Traço-ponto</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px] gap-2 text-xs font-medium text-slate-500">
                                                <span>X</span>
                                                <span>Y</span>
                                                <span></span>
                                            </div>

                                            {serie.type === "gaussian-peak" && serie.gaussianPeak && (
                                                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3">
                                                    <h4 className="mb-3 text-sm font-semibold text-red-900">
                                                        Parâmetros da curva de pico
                                                    </h4>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-slate-600">X mínimo</label>
                                                            <input
                                                                type="number"
                                                                value={serie.gaussianPeak.xMin}
                                                                onChange={(event) =>
                                                                    updateGaussianPeak(serie.id, "xMin", event.target.value)
                                                                }
                                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-xs text-slate-600">X máximo</label>
                                                            <input
                                                                type="number"
                                                                value={serie.gaussianPeak.xMax}
                                                                onChange={(event) =>
                                                                    updateGaussianPeak(serie.id, "xMax", event.target.value)
                                                                }
                                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-xs text-slate-600">Pico em X</label>
                                                            <input
                                                                type="number"
                                                                value={serie.gaussianPeak.peakX}
                                                                onChange={(event) =>
                                                                    updateGaussianPeak(serie.id, "peakX", event.target.value)
                                                                }
                                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-xs text-slate-600">Altura</label>
                                                            <input
                                                                type="number"
                                                                value={serie.gaussianPeak.amplitude}
                                                                onChange={(event) =>
                                                                    updateGaussianPeak(serie.id, "amplitude", event.target.value)
                                                                }
                                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-xs text-slate-600">Largura</label>
                                                            <input
                                                                type="number"
                                                                value={serie.gaussianPeak.width}
                                                                onChange={(event) =>
                                                                    updateGaussianPeak(serie.id, "width", event.target.value)
                                                                }
                                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-xs text-slate-600">Linha de base</label>
                                                            <input
                                                                type="number"
                                                                value={serie.gaussianPeak.baseline}
                                                                onChange={(event) =>
                                                                    updateGaussianPeak(serie.id, "baseline", event.target.value)
                                                                }
                                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-xs text-slate-600">Passo</label>
                                                            <input
                                                                type="number"
                                                                value={serie.gaussianPeak.step}
                                                                onChange={(event) =>
                                                                    updateGaussianPeak(serie.id, "step", event.target.value)
                                                                }
                                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {serie.type === "manual" && (
                                                <div className="space-y-2">
                                                    {serie.points.map((point) => (
                                                        <div
                                                            key={point.id}
                                                            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px] gap-2"
                                                        >
                                                            <input
                                                                type="number"
                                                                value={point.x}
                                                                onChange={(event) =>
                                                                    updatePoint(
                                                                        serie.id,
                                                                        point.id,
                                                                        "x",
                                                                        event.target.value
                                                                    )
                                                                }
                                                                className="min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                            />

                                                            <input
                                                                type="number"
                                                                value={point.y}
                                                                onChange={(event) =>
                                                                    updatePoint(
                                                                        serie.id,
                                                                        point.id,
                                                                        "y",
                                                                        event.target.value
                                                                    )
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

                                                </div>
                                            )}

                                            <button
                                                onClick={() => addPoint(serie.id)}
                                                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                            >
                                                <Plus size={16} />
                                                Adicionar ponto
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
                        <div className="mb-4">
                            <h2 className="font-semibold text-slate-900">Preview</h2>
                            <p className="text-sm text-slate-500">
                                Use o botão de câmera do gráfico para baixar em PNG.
                            </p>
                        </div>

                        <div className="min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 sm:p-4">
                            <ChartPreview chart={chart} />
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
