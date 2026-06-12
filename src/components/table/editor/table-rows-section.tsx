import { Plus, Trash2 } from "lucide-react";
import type { AbntTableConfig } from "../../../types/table";

interface TableRowsSectionProps {
    table: AbntTableConfig;
    addRow: () => void;
    removeRow: (rowId: string) => void;
    updateCell: (rowId: string, columnId: string, value: string) => void;
}

export const TableRowsSection = ({
    table,
    addRow,
    removeRow,
    updateCell,
}: TableRowsSectionProps) => {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-900">Linhas</h2>

                <button
                    onClick={addRow}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                >
                    <Plus size={16} />
                    Linha
                </button>
            </div>

            <div className="max-h-none space-y-4 overflow-visible pr-0 lg:max-h-[26.25rem] lg:overflow-auto lg:pr-2">
                {table.rows.map((row, rowIndex) => (
                    <div
                        key={row.id}
                        className="rounded-xl border border-slate-200 p-3"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">
                                Linha {rowIndex + 1}
                            </span>

                            <button
                                onClick={() => removeRow(row.id)}
                                className="text-slate-500 hover:text-red-600"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {table.columns.map((column) => (
                                <div key={column.id}>
                                    <label className="mb-1 block text-xs text-slate-500">
                                        {column.label}
                                    </label>

                                    <input
                                        value={row.values[column.id] ?? ""}
                                        onChange={(event) =>
                                            updateCell(row.id, column.id, event.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
