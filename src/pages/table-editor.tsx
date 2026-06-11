"use client";

import { useRef, useState } from "react";
import type { AbntColumn, AbntRow, AbntTableConfig } from "../types/table";
import { AbntTablePreview } from "../components/table/abnt-table-preview";
import { ArrowLeft, Plus, Trash2, Download } from "lucide-react";
import { exportElementAsPNG } from "../utils/export-png";
import { initialTable } from "../utils/constants/initial-table";
import { createRandomUUID } from "../utils/create-random-uuid";

interface TableEditorPageProps {
    onBack: () => void;
}

initialTable.rows = [
    {
        id: createRandomUUID(),
        values: {
            [initialTable.columns[0].id]: "Amostra 1",
            [initialTable.columns[1].id]: "0,245",
            [initialTable.columns[2].id]: "10 mg/L",
        },
    },
    {
        id: createRandomUUID(),
        values: {
            [initialTable.columns[0].id]: "Amostra 2",
            [initialTable.columns[1].id]: "0,381",
            [initialTable.columns[2].id]: "20 mg/L",
        },
    },
]

export const TableEditorPage = ({ onBack }: TableEditorPageProps) => {
    const [table, setTable] = useState<AbntTableConfig>(initialTable);
    const previewRef = useRef<HTMLDivElement>(null);

    const handleExportPNG = async () => {
        if (!previewRef.current) {
            return;
        }

        await exportElementAsPNG(previewRef.current, `${table.title || "tabela-abnt"}.png`);
    }

    const updateTable = <K extends keyof AbntTableConfig>(
        key: K,
        value: AbntTableConfig[K]
    ) => {
        setTable((current) => ({
            ...current,
            [key]: value,
        }));
    }

    const updateColumnLabel = (columnId: string, label: string) => {
        setTable((current) => ({
            ...current,
            columns: current.columns.map((column) =>
                column.id === columnId ? { ...column, label } : column
            ),
        }));
    }

    const addColumn = () => {
        const newColumn: AbntColumn = {
            id: createRandomUUID(),
            label: `Coluna ${table.columns.length + 1}`,
        }

        setTable((current) => ({
            ...current,
            columns: [...current.columns, newColumn],
            rows: current.rows.map((row) => ({
                ...row,
                values: {
                    ...row.values,
                    [newColumn.id]: "",
                },
            })),
        }));
    }

    const removeColumn = (columnId: string) => {
        setTable((current) => ({
            ...current,
            columns: current.columns.filter((column) => column.id !== columnId),
            rows: current.rows.map((row) => {
                const values = { ...row.values };
                delete values[columnId];

                return {
                    ...row,
                    values,
                };
            }),
        }));
    }

    const addRow = () => {
        setTable((current) => {
            const values: Record<string, string> = {};

            current.columns.forEach((column) => {
                values[column.id] = "";
            });

            const newRow: AbntRow = {
                id: createRandomUUID(),
                values,
            };

            return {
                ...current,
                rows: [...current.rows, newRow],
            };
        });
    }

    const removeRow = (rowId: string) => {
        setTable((current) => ({
            ...current,
            rows: current.rows.filter((row) => row.id !== rowId),
        }));
    }

    const updateCell = (rowId: string, columnId: string, value: string) => {
        setTable((current) => ({
            ...current,
            rows: current.rows.map((row) =>
                row.id === rowId
                    ? {
                        ...row,
                        values: {
                            ...row.values,
                            [columnId]: value,
                        },
                    }
                    : row
            ),
        }));
    }

    return (
        <main className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 sm:py-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={onBack}
                            className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft size={16} />
                            Voltar
                        </button>

                        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                            Editor de tabela ABNT
                        </h1>

                        <p className="max-w-2xl text-sm text-slate-600">
                            Edite os dados à esquerda e visualize o resultado à direita.
                        </p>
                    </div>
                </header>

                <div className="grid min-w-0 grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]">
                    <section className="min-w-0 space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Título da tabela
                            </label>

                            <textarea
                                value={table.title}
                                onChange={(event) => updateTable("title", event.target.value)}
                                className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Fonte
                            </label>

                            <input
                                value={table.source}
                                onChange={(event) => updateTable("source", event.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                            <h2 className="font-semibold text-slate-900">Aparência</h2>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Fonte
                                </label>

                                <select
                                    value={table.appearance.fontFamily}
                                    onChange={(event) =>
                                        setTable((current) => ({
                                            ...current,
                                            appearance: {
                                                ...current.appearance,
                                                fontFamily: event.target.value,
                                            },
                                        }))
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
                                            setTable((current) => ({
                                                ...current,
                                                appearance: {
                                                    ...current.appearance,
                                                    fontSize: Number(event.target.value),
                                                },
                                            }))
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Espaçamento
                                    </label>

                                    <input
                                        type="number"
                                        value={table.appearance.cellPadding}
                                        onChange={(event) =>
                                            setTable((current) => ({
                                                ...current,
                                                appearance: {
                                                    ...current.appearance,
                                                    cellPadding: Number(event.target.value),
                                                },
                                            }))
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
                                        setTable((current) => ({
                                            ...current,
                                            appearance: {
                                                ...current.appearance,
                                                textAlign: event.target.value as "left" | "center" | "right",
                                            },
                                        }))
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
                                        setTable((current) => ({
                                            ...current,
                                            appearance: {
                                                ...current.appearance,
                                                showHorizontalBorders: event.target.checked,
                                            },
                                        }))
                                    }
                                />

                                Mostrar linhas horizontais
                            </label>
                        </div>

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
                                                            updateCell(
                                                                row.id,
                                                                column.id,
                                                                event.target.value
                                                            )
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
                    </section>

                    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-semibold text-slate-900">Preview</h2>
                                <p className="text-sm text-slate-500">
                                    Visualização antes do download.
                                </p>
                            </div>

                            <button
                                onClick={handleExportPNG}
                                className="flex w-full cursor-pointer justify-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-300 sm:w-auto"
                            >
                                Baixar
                                <Download size={16} />
                            </button>
                        </div>

                        <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-6">
                            <div ref={previewRef} className="mx-auto min-w-[560px] max-w-4xl shadow-sm sm:min-w-0">
                                <AbntTablePreview table={table} />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
