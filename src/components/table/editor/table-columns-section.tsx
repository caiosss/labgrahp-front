import { Plus, Trash2 } from "lucide-react";
import type { AbntTableConfig } from "../../../types/table";

interface TableColumnsSectionProps {
    table: AbntTableConfig;
    updateColumnLabel: (columnId: string, label: string) => void;
    addColumn: () => void;
    removeColumn: (columnId: string) => void;
}

export const TableColumnsSection = ({
    table,
    updateColumnLabel,
    addColumn,
    removeColumn,
}: TableColumnsSectionProps) => {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-900">Colunas</h2>

                <button
                    onClick={addColumn}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                >
                    <Plus size={16} />
                    Coluna
                </button>
            </div>

            <div className="space-y-2">
                {table.columns.map((column) => (
                    <div key={column.id} className="flex min-w-0 gap-2">
                        <input
                            value={column.label}
                            onChange={(event) =>
                                updateColumnLabel(column.id, event.target.value)
                            }
                            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                        <button
                            onClick={() => removeColumn(column.id)}
                            disabled={table.columns.length <= 1}
                            className="rounded-lg border border-slate-300 px-3 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
