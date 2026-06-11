import type { AbntTableConfig } from "../../types/table";

interface AbntTablePreviewProps {
    table: AbntTableConfig;
}

export function AbntTablePreview({ table }: AbntTablePreviewProps) {
    const { appearance } = table;

    const borderClass = appearance.showHorizontalBorders
        ? "border-t border-b border-black"
        : "";

    return (
        <div
            className="bg-white p-4 text-black sm:p-8"
            style={{
                fontFamily: appearance.fontFamily,
                fontSize: `${appearance.fontSize}pt`,
            }}
        >
            <p className="mb-4 break-words font-normal">
                {table.title || "Tabela 1 – Título da tabela"}
            </p>

            <table className="w-full table-fixed border-collapse">
                <thead>
                    <tr className={borderClass}>
                        {table.columns.map((column) => (
                            <th
                                key={column.id}
                                className="break-words align-top font-bold"
                                style={{
                                    padding: `${appearance.cellPadding}px`,
                                    textAlign: appearance.textAlign,
                                }}
                            >
                                {column.label || "Coluna"}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {table.rows.map((row) => (
                        <tr key={row.id}>
                            {table.columns.map((column) => (
                                <td
                                    key={column.id}
                                    className="break-words align-top"
                                    style={{
                                        padding: `${appearance.cellPadding}px`,
                                        textAlign: appearance.textAlign,
                                    }}
                                >
                                    {row.values[column.id] ?? ""}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>

                {appearance.showHorizontalBorders && (
                    <tfoot>
                        <tr className="border-t border-black">
                            <td colSpan={table.columns.length} />
                        </tr>
                    </tfoot>
                )}
            </table>

            <p className="mt-4 break-words text-xs">
                {table.source || "Fonte: Elaborado pelos autores."}
            </p>
        </div>
    );
}
