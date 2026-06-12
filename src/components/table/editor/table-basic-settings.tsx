import type { AbntTableConfig, TableTextAlign } from "../../../types/table";

interface TableBasicSettingsProps {
    table: AbntTableConfig;
    updateTable: <K extends keyof AbntTableConfig>(
        key: K,
        value: AbntTableConfig[K],
    ) => void;
    updateAppearance: <K extends keyof AbntTableConfig["appearance"]>(
        key: K,
        value: AbntTableConfig["appearance"][K],
    ) => void;
}

export const TableBasicSettings = ({
    table,
    updateTable,
    updateAppearance,
}: TableBasicSettingsProps) => {
    return (
        <>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    Titulo da tabela
                </label>

                <textarea
                    value={table.title}
                    onChange={(event) => updateTable("title", event.target.value)}
                    className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Fonte</label>

                <input
                    value={table.source}
                    onChange={(event) => updateTable("source", event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <h2 className="font-semibold text-slate-900">Aparencia</h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Fonte</label>

                    <select
                        value={table.appearance.fontFamily}
                        onChange={(event) =>
                            updateAppearance("fontFamily", event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Calibri">Calibri</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Tamanho
                        </label>

                        <input
                            type="number"
                            value={table.appearance.fontSize}
                            onChange={(event) =>
                                updateAppearance("fontSize", Number(event.target.value))
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Espacamento
                        </label>

                        <input
                            type="number"
                            value={table.appearance.cellPadding}
                            onChange={(event) =>
                                updateAppearance("cellPadding", Number(event.target.value))
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        Alinhamento
                    </label>

                    <select
                        value={table.appearance.textAlign}
                        onChange={(event) =>
                            updateAppearance(
                                "textAlign",
                                event.target.value as TableTextAlign,
                            )
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="left">Esquerda</option>
                        <option value="center">Centro</option>
                        <option value="right">Direita</option>
                    </select>
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={table.appearance.showHorizontalBorders}
                        onChange={(event) =>
                            updateAppearance(
                                "showHorizontalBorders",
                                event.target.checked,
                            )
                        }
                    />
                    Mostrar linhas horizontais
                </label>
            </div>
        </>
    );
};
