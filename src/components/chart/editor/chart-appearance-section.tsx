import type { ChartConfig, ChartMode } from "../../../types/chart";

interface ChartAppearanceSectionProps {
    chart: ChartConfig;
    updateChart: <K extends keyof ChartConfig>(key: K, value: ChartConfig[K]) => void;
    updateAppearance: (key: keyof ChartConfig["appearance"], value: string) => void;
}

export const ChartAppearanceSection = ({
    chart,
    updateChart,
    updateAppearance,
}: ChartAppearanceSectionProps) => {
    return (
        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-900">Aparencia</h2>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    Tipo de grafico
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                        Tamanho do titulo
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        Fundo do grafico
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
    );
};
